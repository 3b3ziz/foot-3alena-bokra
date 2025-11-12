// Mock player data with real career paths
// Each player has clubs in chronological order

export interface PuzzleConfig {
  initialClubs: [string, string];
  thirdClub: string;
  difficulty: number;
}

export interface Player {
  id: string;
  canonical: string;
  clubs: string[];
  years: string[];
  puzzleConfig: PuzzleConfig;
}

export const players: Player[] = [
  {
    id: "ronaldinho",
    canonical: "Ronaldinho",
    clubs: ["Grêmio", "PSG", "Barcelona", "Milan", "Flamengo", "Atlético Mineiro"],
    years: ["1998-2001", "2001-2003", "2003-2008", "2008-2011", "2011-2012", "2012-2014"],
    puzzleConfig: {
      initialClubs: ["PSG", "Milan"],
      thirdClub: "Barcelona",
      difficulty: 6
    }
  },
  {
    id: "ibrahimovic",
    canonical: "Zlatan Ibrahimovic",
    clubs: ["Ajax", "Juventus", "Inter", "Barcelona", "Milan", "PSG", "Manchester United", "LA Galaxy", "Milan"],
    years: ["2001-2004", "2004-2006", "2006-2009", "2009-2011", "2010-2012", "2012-2016", "2016-2018", "2018-2019", "2020-2023"],
    puzzleConfig: {
      initialClubs: ["Ajax", "PSG"],
      thirdClub: "Barcelona",
      difficulty: 7
    }
  },
  {
    id: "pirlo",
    canonical: "Andrea Pirlo",
    clubs: ["Brescia", "Inter", "Reggina", "Brescia", "Milan", "Juventus", "New York City"],
    years: ["1995-1998", "1998-1999", "1999-2000", "2000-2001", "2001-2011", "2011-2015", "2015-2015"],
    puzzleConfig: {
      initialClubs: ["Inter", "Juventus"],
      thirdClub: "Milan",
      difficulty: 5
    }
  },
  {
    id: "eto",
    canonical: "Samuel Eto'o",
    clubs: ["Real Madrid", "Mallorca", "Barcelona", "Inter", "Anzhi", "Chelsea", "Everton"],
    years: ["1997-2000", "2000-2004", "2004-2009", "2009-2011", "2011-2013", "2013-2014", "2014-2015"],
    puzzleConfig: {
      initialClubs: ["Real Madrid", "Barcelona"],
      thirdClub: "Inter",
      difficulty: 6
    }
  },
  {
    id: "beckham",
    canonical: "David Beckham",
    clubs: ["Manchester United", "Real Madrid", "LA Galaxy", "Milan", "PSG"],
    years: ["1992-2003", "2003-2007", "2007-2012", "2009-2010", "2013-2013"],
    puzzleConfig: {
      initialClubs: ["Manchester United", "PSG"],
      thirdClub: "Real Madrid",
      difficulty: 4
    }
  },
  {
    id: "henry",
    canonical: "Thierry Henry",
    clubs: ["Monaco", "Juventus", "Arsenal", "Barcelona", "New York Red Bulls"],
    years: ["1994-1999", "1999-1999", "1999-2007", "2007-2010", "2010-2014"],
    puzzleConfig: {
      initialClubs: ["Juventus", "Barcelona"],
      thirdClub: "Arsenal",
      difficulty: 5
    }
  },
  {
    id: "seedorf",
    canonical: "Clarence Seedorf",
    clubs: ["Ajax", "Sampdoria", "Real Madrid", "Inter", "Milan", "Botafogo"],
    years: ["1992-1995", "1995-1996", "1996-1999", "1999-2002", "2002-2012", "2012-2014"],
    puzzleConfig: {
      initialClubs: ["Ajax", "Milan"],
      thirdClub: "Real Madrid",
      difficulty: 7
    }
  },
  {
    id: "crespo",
    canonical: "Hernan Crespo",
    clubs: ["River Plate", "Parma", "Lazio", "Inter", "Chelsea", "Milan", "Inter", "Genoa", "Parma"],
    years: ["1993-1996", "1996-2000", "2000-2002", "2002-2003", "2003-2008", "2004-2006", "2006-2008", "2008-2009", "2009-2012"],
    puzzleConfig: {
      initialClubs: ["Chelsea", "Inter"],
      thirdClub: "Lazio",
      difficulty: 8
    }
  },
  {
    id: "robinho",
    canonical: "Robinho",
    clubs: ["Santos", "Real Madrid", "Manchester City", "Milan", "Santos", "Guangzhou"],
    years: ["2002-2005", "2005-2008", "2008-2010", "2010-2015", "2015-2016", "2016-2017"],
    puzzleConfig: {
      initialClubs: ["Real Madrid", "Manchester City"],
      thirdClub: "Milan",
      difficulty: 6
    }
  },
  {
    id: "shevchenko",
    canonical: "Andriy Shevchenko",
    clubs: ["Dynamo Kyiv", "Milan", "Chelsea", "Milan", "Dynamo Kyiv"],
    years: ["1994-1999", "1999-2006", "2006-2008", "2008-2009", "2009-2012"],
    puzzleConfig: {
      initialClubs: ["Milan", "Chelsea"],
      thirdClub: "Dynamo Kyiv",
      difficulty: 5
    }
  }
];

// Get today's player (mock - will be replaced with API later)
export const getTodaysPlayer = (): Player => {
  // For now, just return a random player
  // Later: use date-based selection
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % players.length;
  return players[index];
};
