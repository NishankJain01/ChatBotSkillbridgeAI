
import React from 'react';
import { Skill } from './types';

export const SKILLS: Skill[] = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    topics: [
      { id: 'py1', name: 'Variables & Data Types', description: 'Understanding strings, integers, lists, and dictionaries.' },
      { id: 'py2', name: 'Control Flow', description: 'If-else statements, for loops, and while loops.' },
      { id: 'py3', name: 'Functions', description: 'Defining and calling functions, arguments, and return values.' },
      { id: 'py4', name: 'OOP Basics', description: 'Classes, objects, and basic inheritance.' },
      { id: 'py5', name: 'File Handling', description: 'Reading from and writing to files.' },
      { id: 'py6', name: 'Modules & Pip', description: 'Importing libraries and managing packages.' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '📜',
    topics: [
      { id: 'js1', name: 'ES6 Basics', description: 'Let/Const, Arrow functions, and Template literals.' },
      { id: 'js2', name: 'DOM Manipulation', description: 'Selecting and modifying HTML elements.' },
      { id: 'js3', name: 'Async/Await', description: 'Handling asynchronous operations and Promises.' },
      { id: 'js4', name: 'React Fundamentals', description: 'Components, Props, and State.' },
      { id: 'js5', name: 'Web APIs', description: 'Using Fetch API to connect to servers.' }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    topics: [
      { id: 'java1', name: 'Java Basics', description: 'Syntax, variables, and data types.' },
      { id: 'java2', name: 'Collections', description: 'ArrayLists, HashMaps, and Sets.' },
      { id: 'java3', name: 'Interfaces', description: 'Defining contracts for classes.' },
      { id: 'java4', name: 'Streams API', description: 'Modern functional programming in Java.' }
    ]
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: '🗄️',
    topics: [
      { id: 'sql1', name: 'SELECT Basics', description: 'Querying data from a single table.' },
      { id: 'sql2', name: 'Joins', description: 'Combining data from multiple tables.' },
      { id: 'sql3', name: 'Aggregations', description: 'GROUP BY, COUNT, SUM, and AVG.' },
      { id: 'sql4', name: 'Subqueries', description: 'Using queries inside other queries.' }
    ]
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    icon: '📊',
    topics: [
      { id: 'da1', name: 'Excel Basics', description: 'Pivot tables and VLOOKUP.' },
      { id: 'da2', name: 'Pandas', description: 'Data manipulation in Python.' },
      { id: 'da3', name: 'Matplotlib/Seaborn', description: 'Data visualization techniques.' },
      { id: 'da4', name: 'Statistics', description: 'Probability and descriptive statistics.' }
    ]
  }
];
