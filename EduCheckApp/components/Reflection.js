import React, { useState } from 'react';

function Reflection({ onSubmit }) {
  const [reflection, setReflection] = useState("");
  const [correction, setCorrection] = useState("");

  const handleSubmit = () => {
    onSubmit({ reflection, correction });
    setReflection("");
    setCorrection("");
  };

  return (
    <div className="reflection">
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="记录你的反思..."
      />
      <textarea
        value={correction}
        onChange={(e) => setCorrection(e.target.value)}
        placeholder="记录你的改正方法..."
      />
      <button onClick={handleSubmit}>提交反思</button>
    </div>
  );
}

export default Reflection;
