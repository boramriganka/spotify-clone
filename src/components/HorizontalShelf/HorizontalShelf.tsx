import React from 'react';
import './HorizontalShelf.scss';

interface HorizontalShelfProps {
  title?: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

const HorizontalShelf: React.FC<HorizontalShelfProps> = ({ title, children, onSeeAll }) => {
  return (
    <section className="horizontal-shelf">
      <div className="shelf-header">
        {title && <h2>{title}</h2>}
        {onSeeAll && <button onClick={onSeeAll} className="see-all">Show all</button>}
      </div>
      <div className="shelf-content scroll-container">
        {children}
      </div>
    </section>
  );
};

export default HorizontalShelf;
