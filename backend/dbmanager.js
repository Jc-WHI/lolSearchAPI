const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('userInformation.db');

//create user table
const createUserTableSql = `
create table if not exists users(
    puuid TEXT PRIMARY KEY,
    riotid TEXT NOT NULL,
    tag TEXT NOT NULL,
    last_crawled_at TEXT
)`;
const deleteMatches = `
drop table if exists matches
`;
db.run(deleteMatches);

db.run(createUserTableSql, (err) => {
  if (err) {
    return console.error('Error creating table:', err.message);
  }
  console.log('user table created');
});

//create matches table

const createMatchesTablesql = `
    create table if not exists matches (
    matchid TEXT PRIMARY KEY,
    participants TEXT  
    )`;
//participants : json array containing users' all information , Riot Api's info.participants

db.run(createMatchesTablesql, (err) => {
  if (err) {
    return console.error('Error creating table:', err.message);
  }
  console.log('Matches table created');
});

export function getUserInformationQuery(userInfo) {
  userInfo.map((element) => {
    let query = `insert into users(${element.userpuuid},${element.userid},${element.usertag})`;
    db.run(query);
  });
}
