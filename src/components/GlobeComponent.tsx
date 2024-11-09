"use client";

import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import * as d3 from "d3";

// برای استفاده از نوع GeoJSON
import * as GeoJSON from "geojson";

const GlobeComponent: React.FC = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = globeRef.current;
    if (!currentRef) return; // بررسی اینکه آیا `globeRef.current` مقداردهی شده است یا خیر

    const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
    const getVal = (feat: any) =>
      feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

    fetch("/data/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((countries: GeoJSON.FeatureCollection) => {
        const maxVal = Math.max(...countries.features.map(getVal));
        colorScale.domain([0, maxVal]);

        const world = Globe()(currentRef)
          .globeImageUrl(
            "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          )
          .backgroundImageUrl(
            "//unpkg.com/three-globe/example/img/night-sky.png"
          )
          .lineHoverPrecision(0)
          .polygonsData(
            countries.features.filter((d: any) => d.properties.ISO_A2 !== "AQ")
          )
          .polygonAltitude(0.06)
          .polygonCapColor((feat: any) => colorScale(getVal(feat)))
          .polygonSideColor(() => "rgba(0, 100, 0, 0.15)")
          .polygonStrokeColor(() => "#111")
          .polygonLabel((data: any) => {
            // console.log(data);
            const properties = data.properties;
            if (!properties) return ""; // در صورتی که properties موجود نباشد، محتویات را خالی می‌کنیم
            const countryFlagUrl = `https://flagcdn.com/w320/${properties.ISO_A2.toLowerCase()}.png`;
            return `
              <div style="text-align:center">
                <img src="${countryFlagUrl}" alt="Flag of ${properties.ADMIN}" style="width: 50px; height: 30px; margin-bottom: 5px;" />
                <br />
                <b>${properties.ADMIN} (${properties.ISO_A2})</b> <br />
              </div>
            `;
          })
          .onPolygonHover((hoverD: any) =>
            world
              .polygonAltitude((d: any) => (d === hoverD ? 0.12 : 0.06))
              .polygonCapColor((d: any) =>
                d === hoverD ? "steelblue" : colorScale(getVal(d))
              )
          )
          .onPolygonClick((clickedD: any) => {
            // وقتی روی یک کشور کلیک می‌شود، اطلاعات آن کشور را چاپ می‌کنیم
            console.log(
              `کلیک بر روی کشور: ${clickedD.properties.ADMIN} (${clickedD.properties.ISO_A2})`
            );
          })
          .polygonsTransitionDuration(300);
      });
  }, []);

  return <div ref={globeRef} style={{ width: "100%", height: "100vh" }} />;
};

export default GlobeComponent;
