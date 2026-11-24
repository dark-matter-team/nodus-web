import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

function CustomStarNode({ data }) {
  // Тепер вузол знає, яка зараз тема, через data.isDark
  const { isDark, status, label } = data;

  const getStatusClasses = () => {
    if (isDark) {
      switch (status) {
        case 'Completed': return 'text-[#a855f7] drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] fill-[#a855f7]/20';
        case 'Available': return 'text-[#3b82f6] drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] fill-[#3b82f6]/20 animate-pulse';
        default: return 'text-gray-600 opacity-50 fill-transparent';
      }
    } else {
      // Світла (рожева) тема
      switch (status) {
        case 'Completed': return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] fill-white/50';
        case 'Available': return 'text-purple-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] fill-white/20 animate-pulse';
        default: return 'text-purple-300 opacity-60 fill-transparent';
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative w-24 h-24 group cursor-pointer">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <svg 
        viewBox="0 0 24 24" 
        className={`w-14 h-14 transition-transform duration-300 group-hover:scale-110 ${getStatusClasses()}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      
      <div className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded-md text-center shadow-md border backdrop-blur-md transition-colors ${isDark ? 'bg-black/50 text-white border-white/10' : 'bg-white/50 text-purple-950 border-white/50'}`}>
        {label}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export default memo(CustomStarNode);