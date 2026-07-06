// shared/ui/Badge.jsx
import React from 'react';

function Badge({ children, color }) {
  return (
    <span className="badge" style={color ? { color, borderColor: color } : undefined}>
      {children}
    </span>
  );
}

export default Badge;
