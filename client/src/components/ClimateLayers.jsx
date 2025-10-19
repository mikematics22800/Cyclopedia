import { useState } from "react";
import { Checkbox, FormGroup, FormControlLabel, Tooltip, IconButton } from "@mui/material";
import { Close, Settings } from "@mui/icons-material";

const ClimateLayers = ({ onLayerChange }) => {
  const [clouds, setClouds] = useState(true);
  const [precipitation, setPrecipitation] = useState(true);
  const [wind, setWind] = useState(true);
  const [pressure, setPressure] = useState(false);
  const [temp, setTemp] = useState(false);
  const [layers, setLayers] = useState(false);
  const [layersButton, setLayersButton] = useState(true);

  const handleChange = (layer, value) => {
    switch(layer) {
      case 'clouds':
        setClouds(value);
        break;
      case 'precipitation':
        setPrecipitation(value);
        break;
      case 'wind':
        setWind(value);
        break;
      case 'pressure':
        setPressure(value);
        break;
      case 'temp':
        setTemp(value);
        break;
    }
    onLayerChange({ clouds, precipitation, wind, pressure, temp, [layer]: value });
  };

  return (
    <>
      {layersButton ? (
        <div className="flex flex-col gap-2 font-bold text-white bg-black bg-opacity-50 rounded-lg w-fit p-2 cursor-pointer">
          <Tooltip title="Climate Layers" placement="bottom" arrow>
            <IconButton 
              onClick={() => {setLayersButton(false); setLayers(true)}}
              sx={{ 
                padding: 0,
                '&:hover': { 
                  backgroundColor: 'transparent',
                  boxShadow: 'none'
                }
              }}
            >
              <Settings className="!text-2xl text-white"/>
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <div className="bg-black/50 rounded-lg p-4">
          <div className="flex justify-end">
            <IconButton onClick={() => {setLayers(false); setLayersButton(true)}}>
              <Close className="text-white"/>
            </IconButton>
          </div>
          <FormGroup className="text-white">
            <FormControlLabel 
              control={<Checkbox className="!text-white" checked={clouds} onChange={(e) => handleChange('clouds', e.target.checked)}/>} 
              label="Clouds" 
            />
            <FormControlLabel 
              control={<Checkbox className="!text-white" checked={precipitation} onChange={(e) => handleChange('precipitation', e.target.checked)}/>} 
              label="Precipitation" 
            />
            <FormControlLabel 
              control={<Checkbox className="!text-white" checked={wind} onChange={(e) => handleChange('wind', e.target.checked)}/>} 
              label="Wind" 
            />
            <FormControlLabel 
              control={<Checkbox className="!text-white" checked={pressure} onChange={(e) => handleChange('pressure', e.target.checked)}/>} 
              label="Sea Level Pressure" 
            />
            <FormControlLabel 
              control={<Checkbox className="!text-white" checked={temp} onChange={(e) => handleChange('temp', e.target.checked)}/>} 
              label="Sea Level Temperature" 
            />
          </FormGroup>
        </div>
      )}
    </>
  );
};

export default ClimateLayers;

