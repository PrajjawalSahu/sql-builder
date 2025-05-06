import React from 'react';
import MetadataForm from './components/MetadataForm';
import SQLBuilderEditor from './components/SQLBuilderEditor';

function App() {
  return (
    <div className="App">
      <h1>SQL Builder</h1>
      <MetadataForm />
      <SQLBuilderEditor />
    </div>
  );
}

export default App;
