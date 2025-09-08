import React from "react";

interface RocketPartIconProps {
  partType: "body" | "engine" | "wings" | "fuel" | "extras";
  partId: string;
  className?: string;
}

const RocketPartIcon: React.FC<RocketPartIconProps> = ({
  partType,
  partId,
  className = "w-16 h-16",
}) => {
  const getIconForPart = () => {
    switch (partType) {
      case "body":
        return getBodyIcon(partId);
      case "engine":
        return getEngineIcon(partId);
      case "wings":
        return getWingsIcon(partId);
      case "fuel":
        return getFuelIcon(partId);
      case "extras":
        return getExtrasIcon(partId);
      default:
        return getDefaultIcon();
    }
  };

  return (
    <div className={`${className} flex items-center justify-center`}>
      {getIconForPart()}
    </div>
  );
};

const getBodyIcon = (partId: string) => {
  switch (partId) {
    case "aluminum-body":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="aluminumGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient
              id="aluminumAccent"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <filter
              id="aluminumShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#64748B"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="12"
            ry="20"
            fill="url(#aluminumGrad)"
            filter="url(#aluminumShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="15"
            ry="25"
            fill="url(#aluminumGrad)"
            filter="url(#aluminumShadow)"
          />
          <ellipse
            cx="50"
            cy="65"
            rx="12"
            ry="20"
            fill="url(#aluminumGrad)"
            filter="url(#aluminumShadow)"
          />
          <circle cx="38" cy="35" r="1.5" fill="url(#aluminumAccent)" />
          <circle cx="62" cy="35" r="1.5" fill="url(#aluminumAccent)" />
          <circle cx="38" cy="55" r="1.5" fill="url(#aluminumAccent)" />
          <circle cx="62" cy="55" r="1.5" fill="url(#aluminumAccent)" />
          <ellipse
            cx="50"
            cy="45"
            rx="7"
            ry="10"
            fill="#1E40AF"
            opacity="0.9"
          />
          <ellipse cx="50" cy="45" rx="5" ry="8" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="47" cy="42" rx="2" ry="3" fill="#FFFFFF" opacity="0.4" />
        </svg>
      );

    case "carbon-fiber-body":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="carbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient
              id="carbonAccent"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <filter
              id="carbonShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#0F172A"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="12"
            ry="20"
            fill="url(#carbonGrad)"
            filter="url(#carbonShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="15"
            ry="25"
            fill="url(#carbonGrad)"
            filter="url(#carbonShadow)"
          />
          <ellipse
            cx="50"
            cy="65"
            rx="12"
            ry="20"
            fill="url(#carbonGrad)"
            filter="url(#carbonShadow)"
          />
          <rect
            x="36"
            y="35"
            width="28"
            height="1"
            fill="url(#carbonAccent)"
            opacity="0.2"
            rx="0.5"
          />
          <rect
            x="36"
            y="40"
            width="28"
            height="1"
            fill="url(#carbonAccent)"
            opacity="0.2"
            rx="0.5"
          />
          <rect
            x="36"
            y="45"
            width="28"
            height="1"
            fill="url(#carbonAccent)"
            opacity="0.2"
            rx="0.5"
          />
          <rect
            x="36"
            y="50"
            width="28"
            height="1"
            fill="url(#carbonAccent)"
            opacity="0.2"
            rx="0.5"
          />
          <rect
            x="36"
            y="55"
            width="28"
            height="1"
            fill="url(#carbonAccent)"
            opacity="0.2"
            rx="0.5"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="7"
            ry="10"
            fill="#1E40AF"
            opacity="0.9"
          />
          <ellipse cx="50" cy="45" rx="5" ry="8" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="47" cy="42" rx="2" ry="3" fill="#FFFFFF" opacity="0.4" />
        </svg>
      );

    case "titanium-body":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="titaniumGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient
              id="titaniumAccent"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <filter
              id="titaniumShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#64748B"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="12"
            ry="20"
            fill="url(#titaniumGrad)"
            filter="url(#titaniumShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="15"
            ry="25"
            fill="url(#titaniumGrad)"
            filter="url(#titaniumShadow)"
          />
          <ellipse
            cx="50"
            cy="65"
            rx="12"
            ry="20"
            fill="url(#titaniumGrad)"
            filter="url(#titaniumShadow)"
          />
          <line
            x1="36"
            y1="35"
            x2="64"
            y2="35"
            stroke="url(#titaniumAccent)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="36"
            y1="45"
            x2="64"
            y2="45"
            stroke="url(#titaniumAccent)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="36"
            y1="55"
            x2="64"
            y2="55"
            stroke="url(#titaniumAccent)"
            strokeWidth="1"
            opacity="0.3"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="7"
            ry="10"
            fill="#1E40AF"
            opacity="0.9"
          />
          <ellipse cx="50" cy="45" rx="5" ry="8" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="47" cy="42" rx="2" ry="3" fill="#FFFFFF" opacity="0.4" />
        </svg>
      );

    default:
      return getDefaultBodyIcon();
  }
};

const getEngineIcon = (partId: string) => {
  switch (partId) {
    case "liquid-fuel-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="liquidEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FEF2F2" />
              <stop offset="50%" stopColor="#FECACA" />
              <stop offset="100%" stopColor="#F87171" />
            </linearGradient>
            <radialGradient id="flameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EF4444" />
            </radialGradient>
            <filter
              id="engineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#EF4444"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="10"
            ry="6"
            fill="url(#liquidEngineGrad)"
            filter="url(#engineShadow)"
          />
          <ellipse
            cx="50"
            cy="35"
            rx="12"
            ry="8"
            fill="url(#liquidEngineGrad)"
            filter="url(#engineShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="14"
            ry="10"
            fill="url(#liquidEngineGrad)"
            filter="url(#engineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="16"
            ry="12"
            fill="url(#liquidEngineGrad)"
            filter="url(#engineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="12"
            ry="8"
            fill="url(#flameGrad)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="85"
            rx="10"
            ry="6"
            fill="#FB923C"
            opacity="0.6"
          />
          <rect x="45" y="20" width="10" height="2" fill="#DC2626" rx="1" />
          <rect x="40" y="30" width="20" height="1" fill="#DC2626" rx="0.5" />
        </svg>
      );

    case "solid-fuel-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="solidEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="solidFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>
            <filter
              id="solidEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#F59E0B"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <rect
            x="35"
            y="20"
            width="30"
            height="45"
            rx="4"
            fill="url(#solidEngineGrad)"
            filter="url(#solidEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="70"
            rx="18"
            ry="10"
            fill="url(#solidEngineGrad)"
            filter="url(#solidEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="85"
            rx="15"
            ry="8"
            fill="url(#solidFlameGrad)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="90"
            rx="12"
            ry="6"
            fill="#FB923C"
            opacity="0.6"
          />
          <rect
            x="40"
            y="30"
            width="20"
            height="2"
            fill="#D97706"
            opacity="0.6"
            rx="1"
          />
          <rect
            x="40"
            y="40"
            width="20"
            height="2"
            fill="#D97706"
            opacity="0.6"
            rx="1"
          />
          <rect
            x="40"
            y="50"
            width="20"
            height="2"
            fill="#D97706"
            opacity="0.6"
            rx="1"
          />
        </svg>
      );

    case "super-heavy-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="superHeavyGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="50%" stopColor="#D1D5DB" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
            <radialGradient id="superFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="30%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <filter
              id="superEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#6B7280"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="20"
            rx="12"
            ry="8"
            fill="url(#superHeavyGrad)"
            filter="url(#superEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="30"
            rx="16"
            ry="10"
            fill="url(#superHeavyGrad)"
            filter="url(#superEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="40"
            rx="20"
            ry="12"
            fill="url(#superHeavyGrad)"
            filter="url(#superEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="24"
            ry="15"
            fill="url(#superHeavyGrad)"
            filter="url(#superEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="20"
            ry="12"
            fill="url(#superFlameGrad)"
            opacity="0.9"
          />
          <ellipse
            cx="50"
            cy="87"
            rx="16"
            ry="10"
            fill="#FDE68A"
            opacity="0.7"
          />
          <ellipse
            cx="50"
            cy="92"
            rx="12"
            ry="8"
            fill="#F59E0B"
            opacity="0.5"
          />
          <rect x="40" y="15" width="20" height="3" fill="#4B5563" rx="1.5" />
          <rect x="35" y="25" width="30" height="2" fill="#4B5563" rx="1" />
        </svg>
      );

    case "lunar-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="lunarEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="50%" stopColor="#DBEAFE" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <radialGradient id="lunarFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#DBEAFE" />
              <stop offset="50%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#3B82F6" />
            </radialGradient>
            <filter
              id="lunarEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#3B82F6"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="10"
            ry="6"
            fill="url(#lunarEngineGrad)"
            filter="url(#lunarEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="35"
            rx="12"
            ry="8"
            fill="url(#lunarEngineGrad)"
            filter="url(#lunarEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="14"
            ry="10"
            fill="url(#lunarEngineGrad)"
            filter="url(#lunarEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="16"
            ry="12"
            fill="url(#lunarEngineGrad)"
            filter="url(#lunarEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="12"
            ry="8"
            fill="url(#lunarFlameGrad)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="85"
            rx="10"
            ry="6"
            fill="#93C5FD"
            opacity="0.6"
          />
          <rect x="30" y="55" width="2" height="12" fill="#1D4ED8" rx="1" />
          <rect x="68" y="55" width="2" height="12" fill="#1D4ED8" rx="1" />
        </svg>
      );

    case "moon-rocket-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="moonEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FAF5FF" />
              <stop offset="50%" stopColor="#E9D5FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <radialGradient id="moonFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="50%" stopColor="#C4B5FD" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </radialGradient>
            <filter
              id="moonEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#8B5CF6"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="15"
            rx="14"
            ry="10"
            fill="url(#moonEngineGrad)"
            filter="url(#moonEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="25"
            rx="18"
            ry="12"
            fill="url(#moonEngineGrad)"
            filter="url(#moonEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="35"
            rx="22"
            ry="15"
            fill="url(#moonEngineGrad)"
            filter="url(#moonEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="26"
            ry="18"
            fill="url(#moonEngineGrad)"
            filter="url(#moonEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="22"
            ry="15"
            fill="url(#moonFlameGrad)"
            opacity="0.9"
          />
          <ellipse
            cx="50"
            cy="87"
            rx="18"
            ry="12"
            fill="#C4B5FD"
            opacity="0.7"
          />
          <ellipse
            cx="50"
            cy="92"
            rx="14"
            ry="10"
            fill="#8B5CF6"
            opacity="0.5"
          />
          <circle cx="50" cy="10" r="2" fill="#FCD34D" />
          <rect x="45" y="10" width="10" height="1" fill="#7C3AED" rx="0.5" />
        </svg>
      );

    case "nuclear-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="nuclearEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FEF2F2" />
              <stop offset="50%" stopColor="#FECACA" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <radialGradient id="nuclearFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="30%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
            <filter
              id="nuclearEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#DC2626"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="20"
            rx="12"
            ry="8"
            fill="url(#nuclearEngineGrad)"
            filter="url(#nuclearEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="30"
            rx="16"
            ry="10"
            fill="url(#nuclearEngineGrad)"
            filter="url(#nuclearEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="40"
            rx="20"
            ry="12"
            fill="url(#nuclearEngineGrad)"
            filter="url(#nuclearEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="24"
            ry="15"
            fill="url(#nuclearEngineGrad)"
            filter="url(#nuclearEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="20"
            ry="12"
            fill="url(#nuclearFlameGrad)"
            opacity="0.9"
          />
          <ellipse
            cx="50"
            cy="87"
            rx="16"
            ry="10"
            fill="#FDE68A"
            opacity="0.7"
          />
          <ellipse
            cx="50"
            cy="92"
            rx="12"
            ry="8"
            fill="#F59E0B"
            opacity="0.5"
          />
          <circle cx="50" cy="10" r="3" fill="#FCD34D" />
          <circle cx="50" cy="10" r="1.5" fill="#FEF3C7" />
          <rect x="40" y="15" width="20" height="2" fill="#B91C1C" rx="1" />
        </svg>
      );

    case "ion-engine":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="ionEngineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <radialGradient id="ionFlameGrad" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#DBEAFE" />
              <stop offset="50%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#3B82F6" />
            </radialGradient>
            <filter
              id="ionEngineShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#0EA5E9"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="8"
            ry="5"
            fill="url(#ionEngineGrad)"
            filter="url(#ionEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="35"
            rx="10"
            ry="6"
            fill="url(#ionEngineGrad)"
            filter="url(#ionEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="45"
            rx="12"
            ry="8"
            fill="url(#ionEngineGrad)"
            filter="url(#ionEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="14"
            ry="10"
            fill="url(#ionEngineGrad)"
            filter="url(#ionEngineShadow)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="12"
            ry="8"
            fill="url(#ionFlameGrad)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="85"
            rx="10"
            ry="6"
            fill="#93C5FD"
            opacity="0.6"
          />
          <ellipse cx="50" cy="90" rx="8" ry="5" fill="#3B82F6" opacity="0.4" />
          <circle cx="50" cy="15" r="2" fill="#FCD34D" />
          <rect x="45" y="15" width="10" height="1" fill="#0369A1" rx="0.5" />
        </svg>
      );

    default:
      return getDefaultEngineIcon();
  }
};

const getWingsIcon = (partId: string) => {
  switch (partId) {
    case "fins":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="finsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0FDF4" />
              <stop offset="50%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <filter
              id="finsShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#22C55E"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <polygon
            points="50,15 25,55 75,55"
            fill="url(#finsGrad)"
            filter="url(#finsShadow)"
          />
          <polygon
            points="15,35 5,65 25,55"
            fill="url(#finsGrad)"
            opacity="0.7"
            filter="url(#finsShadow)"
          />
          <polygon
            points="85,35 95,65 75,55"
            fill="url(#finsGrad)"
            opacity="0.7"
            filter="url(#finsShadow)"
          />
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="50"
            stroke="#16A34A"
            strokeWidth="2"
          />
          <line
            x1="30"
            y1="30"
            x2="70"
            y2="30"
            stroke="#16A34A"
            strokeWidth="1"
          />
        </svg>
      );

    case "wings":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="wingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="50%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter
              id="wingsShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#10B981"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="50"
            rx="22"
            ry="12"
            fill="url(#wingsGrad)"
            filter="url(#wingsShadow)"
          />
          <ellipse
            cx="25"
            cy="50"
            rx="6"
            ry="10"
            fill="url(#wingsGrad)"
            opacity="0.7"
            filter="url(#wingsShadow)"
          />
          <ellipse
            cx="75"
            cy="50"
            rx="6"
            ry="10"
            fill="url(#wingsGrad)"
            opacity="0.7"
            filter="url(#wingsShadow)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="12"
            ry="6"
            fill="#059669"
            opacity="0.2"
          />
          <line
            x1="30"
            y1="50"
            x2="70"
            y2="50"
            stroke="#059669"
            strokeWidth="2"
          />
        </svg>
      );

    default:
      return getDefaultWingsIcon();
  }
};

const getFuelIcon = (partId: string) => {
  switch (partId) {
    case "liquid-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="liquidTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient
              id="liquidFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter
              id="tankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#0EA5E9"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="10"
            ry="6"
            fill="url(#liquidTankGrad)"
            filter="url(#tankShadow)"
          />
          <rect
            x="40"
            y="25"
            width="20"
            height="35"
            fill="url(#liquidTankGrad)"
            filter="url(#tankShadow)"
          />
          <ellipse
            cx="50"
            cy="60"
            rx="10"
            ry="6"
            fill="url(#liquidTankGrad)"
            filter="url(#tankShadow)"
          />
          <rect
            x="42"
            y="45"
            width="16"
            height="15"
            fill="url(#liquidFuelGrad)"
            opacity="0.6"
          />
          <rect x="45" y="20" width="10" height="2" fill="#0369A1" rx="1" />
          <rect x="45" y="63" width="10" height="2" fill="#0369A1" rx="1" />
        </svg>
      );

    case "solid-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="solidTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <filter
              id="solidTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#0284C7"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <rect
            x="35"
            y="20"
            width="30"
            height="45"
            rx="3"
            fill="url(#solidTankGrad)"
            filter="url(#solidTankShadow)"
          />
          <rect
            x="40"
            y="25"
            width="20"
            height="3"
            fill="#0EA5E9"
            opacity="0.6"
            rx="1.5"
          />
          <rect
            x="40"
            y="35"
            width="20"
            height="3"
            fill="#0EA5E9"
            opacity="0.6"
            rx="1.5"
          />
          <rect
            x="40"
            y="45"
            width="20"
            height="3"
            fill="#0EA5E9"
            opacity="0.6"
            rx="1.5"
          />
          <rect
            x="40"
            y="55"
            width="20"
            height="3"
            fill="#0EA5E9"
            opacity="0.6"
            rx="1.5"
          />
          <rect x="45" y="15" width="10" height="2" fill="#0369A1" rx="1" />
          <rect x="45" y="68" width="10" height="2" fill="#0369A1" rx="1" />
        </svg>
      );

    case "large-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="largeTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient
              id="largeFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter
              id="largeTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#0EA5E9"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="20"
            rx="15"
            ry="10"
            fill="url(#largeTankGrad)"
            filter="url(#largeTankShadow)"
          />
          <rect
            x="35"
            y="20"
            width="30"
            height="45"
            fill="url(#largeTankGrad)"
            filter="url(#largeTankShadow)"
          />
          <ellipse
            cx="50"
            cy="65"
            rx="15"
            ry="10"
            fill="url(#largeTankGrad)"
            filter="url(#largeTankShadow)"
          />
          <rect
            x="38"
            y="35"
            width="24"
            height="30"
            fill="url(#largeFuelGrad)"
            opacity="0.6"
          />
          <rect x="40" y="15" width="20" height="3" fill="#0369A1" rx="1.5" />
          <rect x="40" y="67" width="20" height="3" fill="#0369A1" rx="1.5" />
        </svg>
      );

    case "mega-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="megaTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient
              id="megaFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter
              id="megaTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#0EA5E9"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="15"
            rx="18"
            ry="12"
            fill="url(#megaTankGrad)"
            filter="url(#megaTankShadow)"
          />
          <rect
            x="32"
            y="15"
            width="36"
            height="55"
            fill="url(#megaTankGrad)"
            filter="url(#megaTankShadow)"
          />
          <ellipse
            cx="50"
            cy="70"
            rx="18"
            ry="12"
            fill="url(#megaTankGrad)"
            filter="url(#megaTankShadow)"
          />
          <rect
            x="35"
            y="25"
            width="30"
            height="40"
            fill="url(#megaFuelGrad)"
            opacity="0.6"
          />
          <rect x="40" y="10" width="20" height="4" fill="#0369A1" rx="2" />
          <rect x="40" y="72" width="20" height="4" fill="#0369A1" rx="2" />
          <rect x="30" y="30" width="2" height="25" fill="#0284C7" rx="1" />
          <rect x="68" y="30" width="2" height="25" fill="#0284C7" rx="1" />
        </svg>
      );

    case "moon-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="moonTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="50%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient
              id="moonFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter
              id="moonTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#0EA5E9"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="10"
            rx="20"
            ry="15"
            fill="url(#moonTankGrad)"
            filter="url(#moonTankShadow)"
          />
          <rect
            x="30"
            y="10"
            width="40"
            height="65"
            fill="url(#moonTankGrad)"
            filter="url(#moonTankShadow)"
          />
          <ellipse
            cx="50"
            cy="75"
            rx="20"
            ry="15"
            fill="url(#moonTankGrad)"
            filter="url(#moonTankShadow)"
          />
          <rect
            x="33"
            y="20"
            width="34"
            height="55"
            fill="url(#moonFuelGrad)"
            opacity="0.6"
          />
          <rect x="40" y="5" width="20" height="5" fill="#0369A1" rx="2.5" />
          <rect x="40" y="78" width="20" height="5" fill="#0369A1" rx="2.5" />
          <circle cx="50" cy="5" r="2" fill="#FCD34D" />
          <rect x="45" y="5" width="10" height="1" fill="#0EA5E9" rx="0.5" />
        </svg>
      );

    case "advanced-fuel-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="advancedTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F0FDF4" />
              <stop offset="50%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient
              id="advancedFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <filter
              id="advancedTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#22C55E"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="15"
            rx="18"
            ry="12"
            fill="url(#advancedTankGrad)"
            filter="url(#advancedTankShadow)"
          />
          <rect
            x="32"
            y="15"
            width="36"
            height="55"
            fill="url(#advancedTankGrad)"
            filter="url(#advancedTankShadow)"
          />
          <ellipse
            cx="50"
            cy="70"
            rx="18"
            ry="12"
            fill="url(#advancedTankGrad)"
            filter="url(#advancedTankShadow)"
          />
          <rect
            x="35"
            y="25"
            width="30"
            height="40"
            fill="url(#advancedFuelGrad)"
            opacity="0.6"
          />
          <rect x="40" y="10" width="20" height="4" fill="#16A34A" rx="2" />
          <rect x="40" y="72" width="20" height="4" fill="#16A34A" rx="2" />
          <rect x="30" y="30" width="2" height="25" fill="#15803D" rx="1" />
          <rect x="68" y="30" width="2" height="25" fill="#15803D" rx="1" />
          <circle cx="50" cy="5" r="2" fill="#FCD34D" />
        </svg>
      );

    case "lightweight-tank":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="lightweightTankGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient
              id="lightweightFuelGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter
              id="lightweightTankShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#F59E0B"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="20"
            rx="15"
            ry="10"
            fill="url(#lightweightTankGrad)"
            filter="url(#lightweightTankShadow)"
          />
          <rect
            x="35"
            y="20"
            width="30"
            height="45"
            fill="url(#lightweightTankGrad)"
            filter="url(#lightweightTankShadow)"
          />
          <ellipse
            cx="50"
            cy="65"
            rx="15"
            ry="10"
            fill="url(#lightweightTankGrad)"
            filter="url(#lightweightTankShadow)"
          />
          <rect
            x="38"
            y="30"
            width="24"
            height="30"
            fill="url(#lightweightFuelGrad)"
            opacity="0.6"
          />
          <rect x="40" y="15" width="20" height="3" fill="#D97706" rx="1.5" />
          <rect x="40" y="67" width="20" height="3" fill="#D97706" rx="1.5" />
          <rect x="30" y="35" width="2" height="20" fill="#B45309" rx="1" />
          <rect x="68" y="35" width="2" height="20" fill="#B45309" rx="1" />
        </svg>
      );

    default:
      return getDefaultFuelIcon();
  }
};

const getExtrasIcon = (partId: string) => {
  switch (partId) {
    case "parachute":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="parachuteGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="50%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <filter
              id="parachuteShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#EA580C"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="25"
            rx="22"
            ry="18"
            fill="url(#parachuteGrad)"
            filter="url(#parachuteShadow)"
          />
          <line
            x1="30"
            y1="35"
            x2="25"
            y2="65"
            stroke="#DC2626"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="65"
            stroke="#DC2626"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="35"
            x2="75"
            y2="65"
            stroke="#DC2626"
            strokeWidth="2"
          />
          <ellipse
            cx="50"
            cy="25"
            rx="12"
            ry="10"
            fill="#FB923C"
            opacity="0.2"
          />
          <line
            x1="40"
            y1="25"
            x2="60"
            y2="25"
            stroke="#DC2626"
            strokeWidth="1"
          />
        </svg>
      );

    case "antenna":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient
              id="antennaGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="50%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <filter
              id="antennaShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#EA580C"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <rect
            x="48"
            y="25"
            width="4"
            height="35"
            fill="url(#antennaGrad)"
            filter="url(#antennaShadow)"
          />
          <ellipse
            cx="50"
            cy="20"
            rx="10"
            ry="6"
            fill="url(#antennaGrad)"
            filter="url(#antennaShadow)"
          />
          <ellipse cx="50" cy="20" rx="6" ry="4" fill="#FB923C" opacity="0.4" />
          <circle cx="50" cy="15" r="1.5" fill="#FCD34D" />
          <rect x="45" y="30" width="10" height="1" fill="#FB923C" rx="0.5" />
          <rect x="45" y="40" width="10" height="1" fill="#FB923C" rx="0.5" />
        </svg>
      );

    default:
      return getDefaultExtrasIcon();
  }
};

const getDefaultIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="25" fill="#F3F4F6" />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fill="#6B7280"
      fontSize="24"
      fontFamily="system-ui"
    >
      ?
    </text>
  </svg>
);

const getDefaultBodyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <ellipse cx="50" cy="50" rx="18" ry="28" fill="#F3F4F6" />
    <ellipse cx="50" cy="50" rx="10" ry="16" fill="#E5E7EB" opacity="0.5" />
  </svg>
);

const getDefaultEngineIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <ellipse cx="50" cy="60" rx="18" ry="12" fill="#F3F4F6" />
    <ellipse cx="50" cy="80" rx="12" ry="8" fill="#FED7AA" opacity="0.8" />
  </svg>
);

const getDefaultWingsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <ellipse cx="50" cy="50" rx="22" ry="12" fill="#F3F4F6" />
    <ellipse cx="50" cy="50" rx="12" ry="6" fill="#E5E7EB" opacity="0.5" />
  </svg>
);

const getDefaultFuelIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="35" y="30" width="30" height="35" rx="3" fill="#F3F4F6" />
    <rect x="40" y="40" width="20" height="15" fill="#BAE6FD" opacity="0.6" />
  </svg>
);

const getDefaultExtrasIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="18" fill="#F3F4F6" />
    <circle cx="50" cy="50" r="10" fill="#FED7AA" opacity="0.5" />
  </svg>
);

export default RocketPartIcon;
