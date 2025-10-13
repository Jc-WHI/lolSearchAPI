import 'dotenv/config';

const baseapiURL = 'https://asia.api.riotgames.com';
const aramQueueId = 450; // 칼바람
const MATCH_COUNT = 5; //조회 경기수 파라메터
const apikey = process.env.RIOT_API_KEY;

export function createHeaders(apikey) {
  return {
    'X-Riot-Token': apikey,
  };
}

export async function getPuuid(riotid, tag, apikey) {
  const username = encodeURIComponent(riotid);
  const usertagline = encodeURIComponent(tag);
  const userpuuid = `${baseapiURL}/riot/account/v1/accounts/by-riot-id/${username}/${usertagline}`; //ex)아기개미핥기파르#널름이
  try {
    const response = await fetch(userpuuid, { headers: createHeaders(apikey) });
    global.globalRequest++;
    if (!response) {
      throw new Error(`User Puuid 취득 실패, ${response.status}`);
    }
    const data = await response.json();
    return data.puuid;
  } catch (error) {
    console.log('PUUID 조회중 오류 발생', error.message);
    return null;
  }
}

export async function getAramMatchId(puuid, apikey, start = 0) {
  //유져의 puuid 기반으로 매치 검색
  const matchIdsUrl = `${baseapiURL}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${aramQueueId}&count=${MATCH_COUNT}&start=${start}`;
  try {
    const response = await fetch(matchIdsUrl, { headers: createHeaders(apikey) });
    if (!response.ok) {
      throw new Error(`경기 ID 목록 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('경기 ID 목록 조회 중 오류 발생:', error.message);
    return null;
  }
}

export async function getMatchDetails(matchId, apikey) {
  const matchDetailsUrl = `${baseapiURL}/lol/match/v5/matches/${matchId}`;
  try {
    const response = await fetch(matchDetailsUrl, { headers: createHeaders(apikey) });
    if (!response.ok) {
      // 429 (Too Many Requests) 에러는 잠시 후 재시도할 수 있도록 별도 처리
      if (response.status === 429) {
        console.warn(`API 요청 한도 초과로 대기합니다: ${matchId}`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
        return getMatchDetails(matchId, apikey); // 재귀적으로 함수 다시 호출
      }
      throw new Error(`'${matchId}' 경기 상세 정보 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    return null;
  }
}
export function searchObjects(obj) {
  let participants = obj.map((element) => element.info.participants);

  return participants;
}

//테스트 진행중

export async function main() {
  let userid = '아기개미핥기파르';
  let usertag = '널름이';
  const userpuuid = await getPuuid(userid, usertag, apikey);
  const matchids = await getAramMatchId(userpuuid, apikey);
  if (!matchids || matchids.length === 0) {
    console.log('해당 계정의 플레이 내역이 없습니다.');
    return;
  }
  const matchDetailsPromises = matchids.map((matchid) => getMatchDetails(matchid, apikey));
  const allMatchData = await Promise.all(matchDetailsPromises);
  const teammates = searchObjects(allMatchData);
  /*console.log(allMatchData); // 모든 경기 데이터를 담은 배열 출력 
    console.log("최종결과 출력완료");
    return allMatchData;
}*/
  const userInfoMap = new Map();

  const flatted_teammates = teammates.flat();
  const user_data = flatted_teammates.map((element) => {
    if (!userInfoMap[`${element.puuid}`]) {
      userInfoMap[`${element.puuid}`] = [`${element.riotIdGameName}`, `${element.riotIdTagline}`];
      return {
        id: `${element.riotIdGameName}`,
        tag: `${element.riotIdTagline}`,
        puuid: `${element.puuid}`,
      };
    }
  });
}
