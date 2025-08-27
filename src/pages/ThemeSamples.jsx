import React, { useState } from "react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { heroicons } from '../components/SampleIconsHeroicons';
import { materialIcons } from '../components/SampleIconsMaterial';
import { fontAwesomeIcons } from '../components/SampleIconsFontAwesome';
import { remixIcons } from '../components/SampleIconsRemix';

const iconSets = [
  { name: 'Heroicons', icons: heroicons },
  { name: 'Material Icons', icons: materialIcons },
  { name: 'Font Awesome', icons: fontAwesomeIcons },
  { name: 'Remix Icon', icons: remixIcons },
];

function SampleStatsWidget({ color, icon, title, value, dark, font }) {
  return (
    <div className={`flex items-center p-4 rounded-2xl shadow-lg ${color} mb-4 ${dark ? 'text-white' : 'text-blue-900'}`}
      style={dark ? {background: 'rgba(30,41,59,0.85)', border: '1px solid #38bdf8', fontFamily: font} : {fontFamily: font}}>
      <div className="text-3xl mr-4 cursor-pointer hover:scale-110 transition-transform" title={title}>{icon}</div>
      <div>
        <div className="text-lg font-semibold" style={{fontFamily: font}}>{title}</div>
        <div className="text-2xl font-bold" style={{fontFamily: font}}>{value}</div>
      </div>
    </div>
  );
}

function SampleWidgetSet({ setNumber, mode, logoSrc, dark, bgClass, font, iconSet }) {
  return (
    <div className={`rounded-3xl p-8 shadow-2xl border-2 border-cyan-200/60 relative overflow-hidden animate-fade-in flex flex-col items-center ${bgClass}`} style={{minWidth:320}}>
      {logoSrc && <img src={logoSrc} alt="Logo" style={{width:64, height:64, marginBottom:16, opacity:0.85, background:'none'}} />}
      <h2 className={`text-2xl font-extrabold mb-2 ${dark ? 'text-cyan-200' : 'text-cyan-700'}`} style={{fontFamily: font}}>{iconSet.name} - {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h2>
      <div className="grid grid-cols-1 gap-3 w-full mb-4">
        {iconSet.icons.map((item, i) => (
          <SampleStatsWidget key={i} color={dark ? 'bg-cyan-900 bg-opacity-60' : 'bg-cyan-100'} icon={item.icon} title={item.label} value={128 + i*7} dark={dark} font={font} />
        ))}
      </div>
    </div>
  );
}

// Dynamically select logo based on mode
const getLogoSrc = (mode) => {
  if (mode === 'dark' || mode === 'medium') return '/logo-dark.png';
  return '/logo.png';
};

const themeSamples = [];
const modes = [
  { mode: 'light', dark: false, bgClass: 'imagineer-tomorrowland-light', font: 'Inter, Arial, sans-serif' },
  { mode: 'medium', dark: true, bgClass: 'imagineer-tomorrowland-medium', font: 'Nunito, Arial, sans-serif' },
  { mode: 'dark', dark: true, bgClass: 'imagineer-tomorrowland-dark', font: 'Orbitron, Arial, sans-serif' },
];
iconSets.forEach(iconSet => {
  modes.forEach(({ mode, dark, bgClass, font }, idx) => {
    // Only show Font Awesome as the main icon set
    if (iconSet.name !== 'Font Awesome') return;
    themeSamples.push({
      name: `${iconSet.name} - ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`,
      sample: <SampleWidgetSet setNumber={idx+1} mode={mode} logoSrc={getLogoSrc(mode)} dark={dark} bgClass={bgClass} font={font} iconSet={iconSet} />,
      previewClass: `${iconSet.name.replace(/\s/g,'').toLowerCase()}-${mode}`,
    });
  });
});

export default function ThemeSamples() {
  const [mode, setMode] = useState("light");
  const filteredSamples = themeSamples.filter(t => t.name.toLowerCase().includes(mode));
  return (
    <div className="max-w-5xl scr-mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold scr-heading scr-mb-6">Theme Samples (Font Awesome Only)</h1>
      <div className="flex gap-4 scr-mb-6">
        <Button onClick={() => setMode("light")} className={mode === "light" ? "scr-btn bg-blue-500 text-white" : "scr-btn"}>Light Mode</Button>
        <Button onClick={() => setMode("medium")} className={mode === "medium" ? "scr-btn bg-cyan-700 text-white" : "scr-btn"}>Medium Mode</Button>
        <Button onClick={() => setMode("dark")} className={mode === "dark" ? "scr-btn bg-gray-900 text-white" : "scr-btn"}>Dark Mode</Button>
      </div>
      <div className={mode === "dark" ? "dark" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredSamples.map((theme, i) => (
            <Card key={i} className={`p-0 overflow-hidden ${theme.previewClass} relative`}>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{theme.name}</h2>
              </div>
              <div className="p-6 pt-0">{theme.sample}</div>
            </Card>
          ))}
        </div>
      </div>
      {/* Sample theme CSS (temporary, for preview only) */}
      <style>{`
        .imagineer-tomorrowland-light { background: linear-gradient(120deg, #f8fafc 0%, #e0f7fa 100%); }
        .imagineer-tomorrowland-dark { background: linear-gradient(120deg, #232526 0%, #334155 100%); }
        .imagineer-tomorrowland-medium { background: linear-gradient(120deg, #374151 0%, #64748b 100%); }
      `}</style>
    </div>
  );
}
