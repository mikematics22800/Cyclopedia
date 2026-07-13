'use client';

import dynamic from 'next/dynamic';
import Legend from "./Legend";
import Playback from "./Playback";
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import { IconButton, Tooltip } from "@mui/material";
import { useAppContext } from '../contexts/AppContext';

const Map = dynamic(() => import("./Map"), { ssr: false });
const Globe = dynamic(() => import("./Globe"), { ssr: false });

const Tracker = () => {
  const { globe, setGlobe } = useAppContext();

  const toggleGlobe = () => setGlobe(!globe);

  return (
    <div className="charts">
      {globe ? <Globe/> : <Map/>}
      <div className="map-controls-container">
        <div className="map-controls-panels">
          <Playback />
          <Legend />
        </div>
        <div className="map-controls-toggle">
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
    </div>
  );
};

export default Tracker;
