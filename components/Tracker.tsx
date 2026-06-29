'use client';

import dynamic from 'next/dynamic';
import Globe from "./Globe";
import MapLegend from "./MapLegend";
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import { IconButton, Tooltip } from "@mui/material";
import { useAppContext } from '../contexts/AppContext';

const Map = dynamic(() => import("./Map"), { ssr: false });

const Charts = () => {
  const { globe, setGlobe } = useAppContext();

  const toggleGlobe = () => setGlobe(!globe);

  return (
    <div className="charts">
      {globe ? <Globe/> : <Map/>}
      <div className="map-controls-container">
        <MapLegend />
        <Tooltip
          title={globe ? "Map" : "Globe"}
          placement="bottom"
          arrow
        >
          <div
            className="map-button cursor-pointer"
            onClick={toggleGlobe}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGlobe();
              }
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleGlobe();
              }}
            >
              {!globe ? <PublicIcon className="!text-2xl text-white" /> : <MapIcon className="!text-2xl text-white" />}
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default Charts;
