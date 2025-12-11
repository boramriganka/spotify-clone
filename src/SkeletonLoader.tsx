import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'list' | 'text';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 1, type = 'card' }) => {
  const shimmerStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  const cardSkeleton = (
    <div style={{
      padding: '16px',
      backgroundColor: '#1A1A1A',
      borderRadius: '8px',
      ...shimmerStyle,
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: '4px',
        backgroundColor: '#2A2A2A',
        marginBottom: '16px',
        ...shimmerStyle,
      }} />
      <div style={{
        height: '16px',
        width: '80%',
        borderRadius: '4px',
        backgroundColor: '#2A2A2A',
        marginBottom: '8px',
        ...shimmerStyle,
      }} />
      <div style={{
        height: '14px',
        width: '60%',
        borderRadius: '4px',
        backgroundColor: '#2A2A2A',
        ...shimmerStyle,
      }} />
    </div>
  );

  const listSkeleton = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px',
      backgroundColor: '#1A1A1A',
      borderRadius: '4px',
      marginBottom: '8px',
      ...shimmerStyle,
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '4px',
        backgroundColor: '#2A2A2A',
        ...shimmerStyle,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: '16px',
          width: '70%',
          borderRadius: '4px',
          backgroundColor: '#2A2A2A',
          marginBottom: '8px',
          ...shimmerStyle,
        }} />
        <div style={{
          height: '14px',
          width: '50%',
          borderRadius: '4px',
          backgroundColor: '#2A2A2A',
          ...shimmerStyle,
        }} />
      </div>
    </div>
  );

  const textSkeleton = (
    <div>
      <div style={{
        height: '20px',
        width: '100%',
        borderRadius: '4px',
        backgroundColor: '#1A1A1A',
        marginBottom: '8px',
        ...shimmerStyle,
      }} />
      <div style={{
        height: '20px',
        width: '80%',
        borderRadius: '4px',
        backgroundColor: '#1A1A1A',
        ...shimmerStyle,
      }} />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return cardSkeleton;
      case 'list':
        return listSkeleton;
      case 'text':
        return textSkeleton;
      default:
        return cardSkeleton;
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;

