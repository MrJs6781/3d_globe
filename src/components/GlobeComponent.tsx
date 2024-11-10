"use client";

import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import * as d3 from "d3";
import * as GeoJSON from "geojson";

interface CountryProperties {
  GDP_MD_EST?: number;
  POP_EST?: number;
  ISO_A2: string;
  ADMIN: string;
}

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>;

const GlobeComponent: React.FC = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentRef = globeRef.current;
    if (!currentRef) return;

    const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
    const getVal = (feat: CountryFeature) =>
      (feat.properties?.GDP_MD_EST ?? 0) / Math.max(1e5, feat.properties?.POP_EST ?? 1);

    fetch("/data/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((countries: GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>) => {
        const maxVal = Math.max(...countries.features.map(getVal));
        colorScale.domain([0, maxVal]);

        const world = Globe()(currentRef) as ReturnType<typeof Globe>;

        world
          .globeImageUrl("")
          .backgroundImageUrl("")
          .backgroundColor("rgba(255, 255, 255, 0.15)")  // بدون تصویر زمینه برای کره زمین
          .lineHoverPrecision(0)
          .polygonsData(
            countries.features.filter((d) => d.properties?.ISO_A2 !== "AQ")
          )
          .polygonAltitude(0.06)
          .polygonCapColor(() => "white")  // تنظیم رنگ سفید برای کشورها
          .polygonSideColor(() => "#0085D426")
          .polygonStrokeColor(() => "black")  // تنظیم رنگ سیاه برای مرز کشورها
          .polygonLabel((data: object) => {
            const country = data as CountryFeature;
            const properties = country.properties;
            if (!properties) return "";
            const countryFlagUrl = `https://flagcdn.com/w320/${properties.ISO_A2.toLowerCase()}.png`;
            return `
              <div style="text-align:center">
                <img src="${countryFlagUrl}" alt="Flag of ${properties.ADMIN}" style="width: 50px; height: 30px; margin-bottom: 2px;" />
                <br />
                <b className="font-bold text-lg text-white">${properties.ADMIN} (${properties.ISO_A2})</b> <br />
              </div>
            `;
          })
          .onPolygonHover((hoverD: object | null) => {
            const countryHover = hoverD as CountryFeature | null;
            world
              .polygonAltitude((d: object) => (d === countryHover ? 0.12 : 0.06))
              .polygonCapColor((d: object) => {
                return d === countryHover ? "steelblue" : "white";  // رنگ کشور هنگام انتخاب به آبی تغییر می‌کند
              });
          })
          .onPolygonClick((clickedD: object) => {
            const countryClicked = clickedD as CountryFeature;
            const properties = countryClicked.properties;
            if (properties) {
              console.log(
                `کلیک بر روی کشور: ${properties.ADMIN} (${properties.ISO_A2})`
              );
            }
          })
          .polygonsTransitionDuration(300);
      });
  }, []);

  return (
    <div
      ref={globeRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#f0f0f0",
        overflow : "hidden"
      }}
    />
  );
};

export default GlobeComponent;