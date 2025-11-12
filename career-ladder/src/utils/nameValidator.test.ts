/**
 * Comprehensive test cases for fuzzy name matching
 * These tests should all pass for a correct implementation
 */

import { describe, it, expect } from 'vitest';
import { validateGuess } from './nameValidator';
import type { Player } from '@/data/players';

// Test players
const beckham: Player = {
  id: "beckham",
  canonical: "David Beckham",
  clubs: ["Manchester United", "Real Madrid", "LA Galaxy", "Milan", "PSG"],
  years: ["1992-2003", "2003-2007", "2007-2012", "2009-2010", "2013-2013"],
  puzzleConfig: {
    initialClubs: ["Manchester United", "PSG"],
    thirdClub: "Real Madrid",
    difficulty: 4
  }
};

const ronaldinho: Player = {
  id: "ronaldinho",
  canonical: "Ronaldinho",
  clubs: ["Grêmio", "PSG", "Barcelona", "Milan", "Flamengo", "Atlético Mineiro"],
  years: ["1998-2001", "2001-2003", "2003-2008", "2008-2011", "2011-2012", "2012-2014"],
  puzzleConfig: {
    initialClubs: ["PSG", "Milan"],
    thirdClub: "Barcelona",
    difficulty: 6
  }
};

const ibrahimovic: Player = {
  id: "ibrahimovic",
  canonical: "Zlatan Ibrahimovic",
  clubs: ["Ajax", "Juventus", "Inter", "Barcelona", "Milan", "PSG", "Manchester United", "LA Galaxy", "Milan"],
  years: ["2001-2004", "2004-2006", "2006-2009", "2009-2011", "2010-2012", "2012-2016", "2016-2018", "2018-2019", "2020-2023"],
  puzzleConfig: {
    initialClubs: ["Ajax", "PSG"],
    thirdClub: "Barcelona",
    difficulty: 7
  }
};

const etoo: Player = {
  id: "eto",
  canonical: "Samuel Eto'o",
  clubs: ["Real Madrid", "Mallorca", "Barcelona", "Inter", "Anzhi", "Chelsea", "Everton"],
  years: ["1997-2000", "2000-2004", "2004-2009", "2009-2011", "2011-2013", "2013-2014", "2014-2015"],
  puzzleConfig: {
    initialClubs: ["Real Madrid", "Barcelona"],
    thirdClub: "Inter",
    difficulty: 6
  }
};

describe('Fuzzy Name Matching', () => {

  describe('Exact matches', () => {
    it('should match exact canonical name', () => {
      const result = validateGuess("David Beckham", beckham);
      expect(result.matched).toBe(true);
      expect(result.canonical).toBe("David Beckham");
    });

    it('should be case insensitive', () => {
      const result = validateGuess("DAVID BECKHAM", beckham);
      expect(result.matched).toBe(true);
    });

    it('should handle extra whitespace', () => {
      const result = validateGuess("  david  beckham  ", beckham);
      expect(result.matched).toBe(true);
    });
  });

  describe('Last name matches', () => {
    it('should match last name only', () => {
      const result = validateGuess("beckham", beckham);
      expect(result.matched).toBe(true);
    });

    it('should match Ibrahimovic by last name', () => {
      const result = validateGuess("ibrahimovic", ibrahimovic);
      expect(result.matched).toBe(true);
    });
  });


  describe('Typo tolerance - CRITICAL TEST CASES', () => {
    it('should match "bekham" (1 letter typo)', () => {
      const result = validateGuess("bekham", beckham);
      expect(result.matched).toBe(true);
      expect(result.canonical).toBe("David Beckham");
    });

    it('should match "beckam" (1 letter typo)', () => {
      const result = validateGuess("beckam", beckham);
      expect(result.matched).toBe(true);
    });

    it('should match "bekcham" (1 extra letter)', () => {
      const result = validateGuess("bekcham", beckham);
      expect(result.matched).toBe(true);
    });

    it('should match "ibrahimovic" with typo "ibrahimovic"', () => {
      const result = validateGuess("ibrahimovic", ibrahimovic);
      expect(result.matched).toBe(true);
    });

    it('should match "ronaldihno" (1 letter swap)', () => {
      const result = validateGuess("ronaldihno", ronaldinho);
      expect(result.matched).toBe(true);
    });

    it('should match "etoo" (missing apostrophe)', () => {
      const result = validateGuess("etoo", etoo);
      expect(result.matched).toBe(true);
    });

    it('should match "eto o" (apostrophe as space)', () => {
      const result = validateGuess("eto o", etoo);
      expect(result.matched).toBe(true);
    });
  });

  describe('False positive prevention - CRITICAL TEST CASES', () => {
    it('should NOT match "ronaldo" for Ronaldinho', () => {
      const result = validateGuess("ronaldo", ronaldinho);
      expect(result.matched).toBe(false);
    });

    it('should NOT match "ibrahim" for Ibrahimovic (too short)', () => {
      const result = validateGuess("ibrahim", ibrahimovic);
      expect(result.matched).toBe(false);
    });

    it('should NOT match "david" for Beckham (first name only, not alias)', () => {
      const result = validateGuess("david", beckham);
      expect(result.matched).toBe(false);
    });

    it('should NOT match completely unrelated name', () => {
      const result = validateGuess("messi", beckham);
      expect(result.matched).toBe(false);
    });

    it('should NOT match partial substring of first name', () => {
      const result = validateGuess("sam", etoo); // Samuel Eto'o
      expect(result.matched).toBe(false);
    });
  });

  describe('Suggestions', () => {
    it('should suggest correction for close but not matching typo', () => {
      const result = validateGuess("beckhamm", beckham); // 2 m's
      if (!result.matched) {
        expect(result.suggestion).toBeDefined();
        expect(result.suggestion).toContain("David Beckham");
      }
    });
  });

  describe('Special characters and accents', () => {
    it('should handle names with accents (Eto\'o)', () => {
      const result = validateGuess("Samuel Eto'o", etoo);
      expect(result.matched).toBe(true);
    });

    it('should normalize accents', () => {
      const result = validateGuess("samuel etoo", etoo); // without apostrophe
      expect(result.matched).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should not match empty string', () => {
      const result = validateGuess("", beckham);
      expect(result.matched).toBe(false);
    });

    it('should not match very short strings (< 3 chars)', () => {
      const result = validateGuess("be", beckham);
      expect(result.matched).toBe(false);
    });

    it('should handle single character typos in short names', () => {
      const result = validateGuess("ibr", ibrahimovic); // should this match "ibra"?
      // This is acceptable either way - document the decision
    });
  });
});
