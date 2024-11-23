import React from 'react';

function Feedback({ questionNumber, hint }) {
  return (
    <div className="feedback">
      <p>建议：请重新检查第{questionNumber}题的答案。</p>
      <p>提示：{hint}</p>
    </div>
  );
}

export default Feedback;
