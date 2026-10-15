import React from 'react';

type LoadingProps  = {
  text?: string,
  error?: string
}

const Loading = ({text = '', error}: LoadingProps) => {
  return (
    <main className="loading">
      {text}{error &&
      <p className="error">{error}</p>
      }
    </main>
  );
};

export default Loading;