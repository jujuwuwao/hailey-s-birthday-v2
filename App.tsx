import React from 'react';
import Scene from './components/Scene';
import UI from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Scene />
      <UI />
    </div>
  );
};

export default App;
