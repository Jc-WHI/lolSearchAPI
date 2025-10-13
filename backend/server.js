import {
  createHeaders,
  getPuuid,
  getAramMatchId,
  searchObjects,
  getMatchDetails,
} from './getUserPuuid.js';
import 'dotenv/config';
const baseapiURL = 'https://asia.api.riotgames.com';
const aramQueueId = 450; // 칼바람
const MATCH_COUNT = 10; //조회 경기수 파라메터

let globalRequest = 0;
global.globalRequest = globalRequest;
const apikey = process.env.RIOT_API_KEY;
let globalTimer = Date.now();
global.globalTimer = globalTimer;

// 20 requests every 1 seconds(s)
//100 requests every 2 minutes(s)

async function search(userName, userTag, start, end) {
  const userpuuid = await getPuuid(userName, userTag, apikey);
  const matchIds = await getAramMatchId(userpuuid, apikey, start, end);
  if (!matchIds || matchIds.length === 0) {
    console.log('해당 계정의 플레이 내역이 없습니다.');
    console.log('게임 이력이 없으므로 검색을 종료합니다');
    return;
  }
  const matchDetailsPromises = matchIds.map((matchid) => getMatchDetails(matchid, apikey));
  const allMatchData = await Promise.all(matchDetailsPromises);
  const teammates = searchObjects(allMatchData);
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
  console.log(user_data);
}

await search('아기개미핥기파르', '널름이', 0);
