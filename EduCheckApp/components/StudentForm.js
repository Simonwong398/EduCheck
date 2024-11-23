import React, { useState } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@material-ui/core';

function StudentForm() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // 提交数据到后端
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="student-name"
        label="学生姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <FormControl required>
        <InputLabel id="grade-label">年级</InputLabel>
        <Select
          labelId="grade-label"
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <MenuItem value="1">一年级</MenuItem>
          <MenuItem value="2">二年级</MenuItem>
          {/* 其他年级选项 */}
        </Select>
      </FormControl>
      <FormControl required>
        <InputLabel id="subject-label">学科</InputLabel>
        <Select
          labelId="subject-label"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <MenuItem value="math">数学</MenuItem>
          <MenuItem value="chemistry">化学</MenuItem>
          <MenuItem value="physics">物理</MenuItem>
          <MenuItem value="grammar">语法</MenuItem>
          {/* 其他学科选项 */}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">提交</Button>
    </form>
  );
}

export default StudentForm;
