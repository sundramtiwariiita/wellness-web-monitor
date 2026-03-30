import { useState } from 'react';
import { FcPrevious, FcNext } from "react-icons/fc";
import './QuestionSlider.css'
import data from "./questionData.json"

const QuestionSlider = () => {
  const [current, setCurrent] = useState(0);
  const length = data.length;
  // console.log(data);
  const nextSlide = () => {

    setCurrent(current === length - 1 ? length - 1 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? 0 : current - 1)
  };

  if (!Array.isArray(data) || data.length <= 0) {
    return null;
  }

  return (
    <div className='slider'>
      {
        data?.map((slide, index) => {
          return (
            <>
              {
                current === 0 ? 
                ""
                :
                <FcPrevious className="left-arrow" onClick={prevSlide} />
              }
              <div
                className={index === current ? 'slide active' : 'slide'}
                key={index}>
                {index === current && (
                  <>
                    <h2>Question {slide.num}:</h2>
                    <h1>{slide.question}</h1>
                  </>
                )}
              </div>
              {
                current === 10 ? 
                ""
                : 
                <FcNext className="right-arrow" onClick={nextSlide} />
              }
            </>
          );
        })
      }
    </div>
  );
};

export default QuestionSlider;
