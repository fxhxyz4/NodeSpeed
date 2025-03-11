const searchIncorrectWords = (Answer, Source) => {
  const arrayAnswer = Answer.split(/\s+/).filter((word) => word.trim() !== "");
  const arraySource = Source.split(/\s+/).filter((word) => word.trim() !== "");

  let repeatString = "";

  if (arrayAnswer.length !== arraySource.length) {
    const lengthDifference = Math.abs(arrayAnswer.length - arraySource.length);

    if (arrayAnswer.length < arraySource.length) {
      for (let i = 0; i < lengthDifference; i++) {
        arrayAnswer.push(repeatString);
      }
    } else {
      for (let i = 0; i < lengthDifference; i++) {
        arraySource.push(repeatString);
      }
    }
  }

  let incorrectCounter = 0;

  arrayAnswer.forEach((word, index) => {
    if (arraySource[index] !== word) {
      incorrectCounter++;
    }
  });

  return incorrectCounter;
};

export { searchIncorrectWords };
