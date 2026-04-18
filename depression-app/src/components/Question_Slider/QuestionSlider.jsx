import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import './QuestionSlider.css'
import data from "./questionData.json"

const QuestionSlider = () => {
  const [current, setCurrent] = useState(0);
  const length = data.length;

  if (!Array.isArray(data) || data.length <= 0) {
    return null;
  }

  const currentSlide = data[current];
  const nextSlide = () => {
    setCurrent((value) => (value === length - 1 ? length - 1 : value + 1));
  };

  const prevSlide = () => {
    setCurrent((value) => (value === 0 ? 0 : value - 1));
  };

  const progress = `${((current + 1) / length) * 100}%`;

  return (
    <div className='question-slider'>
      <div className="question-slider__top">
        <div>
          <p className="wm-eyebrow">Reflection prompt</p>
          <h2>Question {currentSlide.num}</h2>
        </div>
        <span className="question-slider__counter">{current + 1} / {length}</span>
      </div>

      <div className="question-slider__progress" aria-hidden="true">
        <span style={{ width: progress }} />
      </div>

      <div className="question-slider__body">
        <p>{currentSlide.question}</p>
      </div>

      <div className="question-slider__actions">
        <button type="button" className="question-slider__nav" onClick={prevSlide} disabled={current === 0}>
          <FiChevronLeft aria-hidden="true" />
          <span>Previous</span>
        </button>

        <button type="button" className="question-slider__nav question-slider__nav--next" onClick={nextSlide} disabled={current === length - 1}>
          <span>Next</span>
          <FiChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default QuestionSlider;
