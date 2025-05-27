import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import ProfileIcon from '../components/profileicon';
import PomodoroSticky from '../components/pomodorosticky';

function SubjectsExamsPage() {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('subjectsData');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSubject, setNewSubject] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamPercent, setNewExamPercent] = useState('');
  const [newExamResources, setNewExamResources] = useState('');
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('subjectsData', JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    setSubjects((prev) => [...prev, { name: trimmed, exams: [] }]);
    setNewSubject('');
  };

  const addExam = () => {
    if (
      selectedSubjectIndex === null ||
      !newExamName.trim() ||
      !newExamPercent.trim() ||
      isNaN(newExamPercent) ||
      Number(newExamPercent) <= 0 ||
      !newExamResources.trim()
    )
      return;

    // Make deep copy for immutability
    const updatedSubjects = subjects.map((subject, idx) => {
      if (idx === selectedSubjectIndex) {
        return {
          ...subject,
          exams: [
            ...subject.exams,
            {
              name: newExamName.trim(),
              percent: Number(newExamPercent),
              resources: newExamResources.trim(),
            },
          ],
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);

    // Clear exam inputs after adding
    setNewExamName('');
    setNewExamPercent('');
    setNewExamResources('');
  };

  return (
    <div className="subjects-page bg-grid" style={{ padding: '1rem', minHeight: '100vh' }}>
      <div className="top-left">
        <ProfileIcon />
      </div>

      <PomodoroSticky />

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📚 Subjects and Exams Tracker</h2>

        {/* Add Subject */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Enter new subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            style={{
              padding: '8px',
              width: '60%',
              marginRight: '1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
            }}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
          />
          <button
            onClick={addSubject}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            disabled={!newSubject.trim()}
          >
            Add Subject
          </button>
        </div>

        {/* Subjects List */}
        <div>
          {subjects.length === 0 && <p style={{ color: '#777' }}>No subjects added yet.</p>}

          {subjects.map((subject, i) => (
            <div
              key={i}
              style={{
                marginBottom: '2rem',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3
                style={{
                  cursor: 'pointer',
                  color: selectedSubjectIndex === i ? '#4f46e5' : '#333',
                }}
                onClick={() => setSelectedSubjectIndex(i === selectedSubjectIndex ? null : i)}
              >
                {subject.name} {selectedSubjectIndex === i ? '▲' : '▼'}
              </h3>

              {/* Exams input only for selected subject */}
              {selectedSubjectIndex === i && (
                <div style={{ marginTop: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Exam name"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    style={{
                      padding: '6px',
                      marginRight: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Percentage (%)"
                    value={newExamPercent}
                    onChange={(e) => setNewExamPercent(e.target.value)}
                    style={{
                      width: '100px',
                      padding: '6px',
                      marginRight: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Resources (books, links...)"
                    value={newExamResources}
                    onChange={(e) => setNewExamResources(e.target.value)}
                    style={{
                      padding: '6px',
                      marginRight: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      width: '40%',
                    }}
                  />
                  <button
                    onClick={addExam}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    disabled={
                      !newExamName.trim() ||
                      !newExamPercent.trim() ||
                      isNaN(newExamPercent) ||
                      Number(newExamPercent) <= 0 ||
                      !newExamResources.trim()
                    }
                  >
                    Add Exam
                  </button>
                </div>
              )}

              {/* Exams List */}
              <ul style={{ marginTop: '1rem', paddingLeft: '20px' }}>
                {subject.exams.length === 0 && (
                  <li style={{ color: '#999' }}>No exams added.</li>
                )}
                {subject.exams.map((exam, idx) => (
                  <li key={idx} style={{ marginBottom: '0.6rem' }}>
                    <strong>{exam.name}</strong> - {exam.percent}% — Resources:{' '}
                    {exam.resources}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Navbar />
    </div>
  );
}

export default SubjectsExamsPage;
