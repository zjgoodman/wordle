import logo from "./logo.svg";
import "./App.css";
import { Button, Input, TextField } from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { ALLOWED_WORDS } from "./wordle-allowed-words";
import { ALL_WORDLES } from "./wordles-all";

const DICTIONARY_WORDS = [...ALLOWED_WORDS, ...ALL_WORDLES];

const GUESS_LENGTH = 5;
const MAXIMUM_GUESSES = 6;

function isDictionaryWord(guess) {
  return DICTIONARY_WORDS.includes(guess);
}

function App({ correctAnswer = "FLAIR" }) {
  const [submittedGuesses, setSubmittedGuesses] = useState([]);
  const [confirmedRules, setConfirmedRules] = useState([]);

  function ColoredText({ text, color = "black" }) {
    return <label style={{ fontSize: 64, color: color }}>{text}</label>;
  }

  function PreviousGuess({ value }) {
    if (!value) {
      return <></>;
    }
    let text = [];
    for (let index = 0; index < value.length; ++index) {
      const actualLetter = value.charAt(index);
      const expectedLetter = correctAnswer.charAt(index);
      const color =
        actualLetter === expectedLetter
          ? "green"
          : correctAnswer.includes(actualLetter)
          ? "yellow"
          : "black";
      text.push(<ColoredText text={actualLetter} color={color} />);
    }
    return <h2>{text}</h2>;
  }

  function getIntersection(iterables) {
    let intersection = iterables[0] || [];
    iterables.forEach((matchingWords) => {
      intersection = intersection.filter((word) =>
        matchingWords.includes(word)
      );
    });
    return intersection;
  }

  function doesWordMatchRule(word, rule) {
    const { relationship, index, value, not } = rule;
    if (relationship === "index") {
      if (not) {
        return word.charAt(index) !== value;
      } else {
        return word.charAt(index) === value;
      }
    } else {
      if (not) {
        return !word.includes(value);
      } else {
        return word.includes(value);
      }
    }
  }

  function PossibleWords({ label, rules }) {
    const allMatches = rules.map((rule) => {
      return DICTIONARY_WORDS.filter((word) => doesWordMatchRule(word, rule));
    });
    const intersection = getIntersection(allMatches);
    const wordBullets = intersection.map((word) => <li key={word}>{word}</li>);
    const numberOfPossibilities = wordBullets.length;
    return (
      <div>
        <h3>
          {label} ({numberOfPossibilities})
        </h3>
        {numberOfPossibilities < 30 && <ul>{wordBullets}</ul>}
      </div>
    );
  }

  function buildRulesFromGuess(guess) {
    const rules = [];
    if (guess) {
      for (let index = 0; index < guess.length; ++index) {
        const letter = guess.charAt(index);
        rules.push({ relationship: "index", index: index, value: letter });
      }
    }
    return rules;
  }

  function getRulesFromSubmittedGuess(guess, correctAnswer) {
    guess = guess.toLowerCase();
    correctAnswer = correctAnswer.toLowerCase();
    const rules = [];
    for (let index = 0; index < guess.length; ++index) {
      const expectedLetter = correctAnswer.charAt(index);
      const actualLetter = guess.charAt(index);
      if (expectedLetter === actualLetter) {
        rules.push({
          relationship: "index",
          index: index,
          value: actualLetter,
        });
      } else if (correctAnswer.includes(actualLetter)) {
        rules.push({
          relationship: "index",
          index: index,
          value: actualLetter,
          not: true,
        });
        rules.push({ relationship: "includes", value: actualLetter });
      } else {
        rules.push({
          relationship: "includes",
          value: actualLetter,
          not: true,
        });
      }
    }
    return rules;
  }

  function GuessForm() {
    const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { isValid },
    } = useForm({ mode: "onChange", reValidateMode: "onChange" });
    function submitGuess(submission) {
      const guess = submission.guess.toUpperCase();
      setSubmittedGuesses([...submittedGuesses, guess]);
      setConfirmedRules([
        ...confirmedRules,
        ...getRulesFromSubmittedGuess(guess, correctAnswer),
      ]);
      reset();
    }
    const guess = watch("guess");
    const legalWordsFromCurrentGuess = buildRulesFromGuess(guess);
    return (
      <form onSubmit={handleSubmit(submitGuess)}>
        <Controller
          name="guess"
          control={control}
          rules={{
            required: true,
            pattern: /^[a-z]{5}$/i,
            validate: isDictionaryWord,
          }}
          defaultValue=""
          render={({ field }) => (
            <TextField {...field} inputProps={{ maxLength: GUESS_LENGTH }} />
          )}
        />
        <Button onClick={handleSubmit(submitGuess)} disabled={!isValid}>
          Submit
        </Button>
        {confirmedRules.length > 0 && (
          <PossibleWords
            label="Possible correct answers from current guess"
            rules={[...confirmedRules, ...legalWordsFromCurrentGuess]}
          />
        )}
        <PossibleWords
          label="Legal words from current guess"
          rules={legalWordsFromCurrentGuess}
        />
        <PossibleWords
          label="Possible correct answers from what you know so far"
          rules={confirmedRules}
        />
      </form>
    );
  }

  const previousGuesses = submittedGuesses.map((word) => (
    <PreviousGuess key={word} value={word} />
  ));
  const win = submittedGuesses.includes(correctAnswer);
  const hasMoreGuessesAvailable =
    !win && submittedGuesses.length < MAXIMUM_GUESSES;
  return (
    <div>
      <h1>Wordle</h1>
      {previousGuesses}
      {hasMoreGuessesAvailable ? <GuessForm /> : win ? "You won!" : "You lost!"}
    </div>
  );
}

export default App;
