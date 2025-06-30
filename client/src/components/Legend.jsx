import { useState } from "react";
import List from '@mui/icons-material/List';
import Tooltip from '@mui/material/Tooltip';

const Legend = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
      <div className="legend-container">
      {isOpen ? (
        <div className="legend" onClick={() => setIsOpen(!isOpen)}>
          <div className="key">
            <span className="bg-[dodgerblue]"/>
            <h1 className="text-sm">TD</h1>
          </div>
          <div className="key">
            <span className="color bg-[lime]"/>
            <h1 className="text-sm">TS</h1>
          </div>
          <div className="key">
            <span className="bg-[yellow]"/>
            <h1 className="text-sm">H1</h1>
          </div>
          <div className="key">
            <span className="bg-[orange]"/>
            <h1 className="text-sm">H2</h1>
          </div>
          <div className="key">
            <span className="bg-[red]"/>
            <h1 className="text-sm">H3</h1>
          </div>
          <div className="key">
            <span className="bg-[hotpink]"/>
            <h1 className="text-sm">H4</h1>
          </div>
          <div className="key">
            <span className="bg-[pink]"/>
            <h1 className="text-sm">H5</h1>
          </div>
          <div className="key">
            <span className="bg-[aqua]"/>
            <h1 className="text-sm">SD</h1>
          </div>
          <div className="key">
            <span className="bg-[#D0F0C0]"/>
            <h1 className="text-sm">SS</h1>
          </div>
          <div className="key">
            <span className="bg-[#7F00FF]"/>
            <h1 className="text-sm">EX</h1>
          </div>
          <div className="key">
            <span className="bg-[gray]"/>
            <h1 className="text-sm">WV</h1>
          </div>
          <div className="key">
            <span className="bg-[lightgray]"/>
            <h1 className="text-sm">DB</h1>
          </div>
          <div className="key">
            <span className="bg-white"/>
            <h1 className="text-sm">LO</h1>
          </div>
        </div>
    ) : (
      <div className="legend" onClick={() => setIsOpen(!isOpen)}>
        <Tooltip title="Legend" arrow placement="left">
          <List className="text-white" />
        </Tooltip>
      </div>
    )}
    </div>
  );
};

export default Legend; 