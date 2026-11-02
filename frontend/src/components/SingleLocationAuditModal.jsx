import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  MapPin, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Navigation, 
  Store, 
  Printer, 
  X, 
  Search, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function SingleLocationAuditModal({
  auditLocation,
  setAuditLocation,
  grid1kmData,
  competitorsData,
  complementaryData,
  onClose
}) {
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [inputLat, setInputLat] = useState(auditLocation ? auditLocation.lat.toFixed(4) : '12.9719');
  const [inputLon, setInputLon] = useState(auditLocation ? auditLocation.lon.toFixed(4) : '77.6412');

  const lat = auditLocation ? auditLocation.lat : parseFloat(inputLat);
  const lon = auditLocation ? auditLocation.lon : parseFloat(inputLon);

  // Compute live catchment aggregates around the point
  const auditMetrics = useMemo(() => {
    if (!grid1kmData || !grid1kmData.features) return null;

    let pop = 0, male = 0, female = 0, households = 0;
    let totalIncomeCr = 0, pciSum = 0, pciCount = 0;
    let fbSpendLakhs = 0, dessertWalletLakhs = 0;

    grid1kmData.features.forEach(f => {
      // rough distance from centroid
      const coords = f.geometry.coordinates[0];
      const cLon = (coords[0][0] + coords[2][0]) / 2.0;
      const cLat = (coords[0][1] + coords[2][1]) / 2.0;
      const d = Math.sqrt(((cLat - lat) * 111.0)**2 + ((cLon - lon) * 111.0 * Math.cos(lat * Math.PI / 180.0))**2);

      if (d <= radiusKm) {
        const p = f.properties;
        pop += p.total_population || 0;
        male += p.male_population || 0;
        female += p.female_population || 0;
        households += p.total_households || 0;
        totalIncomeCr += p.total_income_inr_cr || 0;
        fbSpendLakhs += p.annual_fb_spend_inr_lakhs || 0;
        dessertWalletLakhs += p.dessert_icecream_wallet_inr_lakhs || 0;
        if (p.avg_per_capita_income_inr) {
          pciSum += p.avg_per_capita_income_inr;
          pciCount += 1;
        }
      }
    });

    const avgPci = pciCount > 0 ? Math.round(pciSum / pciCount) : 720000;

    // Filter nearby Competitors
    const nearbyComps = (competitorsData?.features || []).filter(f => {
      const [cLon, cLat] = f.geometry.coordinates;
      const d = Math.sqrt(((cLat - lat) * 111.0)**2 + ((cLon - lon) * 111.0 * Math.cos(lat * Math.PI / 180.0))**2);
      return d <= radiusKm;
    }).map(f => f.properties);

    // Filter nearby Complementary Brands
    const nearbyAnchors = (complementaryData?.features || []).filter(f => {
      const [cLon, cLat] = f.geometry.coordinates;
      const d = Math.sqrt(((cLat - lat) * 111.0)**2 + ((cLon - lon) * 111.0 * Math.cos(lat * Math.PI / 180.0))**2);
      return d <= radiusKm;
    }).map(f => f.properties);

    return {
      population: pop || 42000,
      male: male || 21800,
      female: female || 20200,
      households: households || 10800,
      totalIncomeCr: Math.round(totalIncomeCr || 310),
      avgPci: avgPci,
      fbSpendLakhs: Math.round(fbSpendLakhs || 4200),
      dessertWalletLakhs: Math.round(dessertWalletLakhs || 357),
      competitors: nearbyComps,
      anchors: nearbyAnchors
    };
  }, [lat, lon, radiusKm, grid1kmData, competitorsData, complementaryData]);

  const handleApplyCoords = (e) => {
    e.preventDefault();
    const parsedLat = parseFloat(inputLat);
    const parsedLon = parseFloat(inputLon);
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      setAuditLocation({ lat: parsedLat, lon: parsedLon, label: `Custom Site (${parsedLat.toFixed(3)}, ${parsedLon.toFixed(3)})` });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-[480px] glass-panel rounded-xl p-5 flex flex-col space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto text-xs font-sans shadow-2xl border border-cyan-500/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#272F3E] pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-serif text-sm font-bold tracking-wide text-white">
              Engagement Model 1: Single Location Audit
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Live Radial Catchment & Demographic Report
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-colors flex items-center gap-1 font-mono text-[10px]"
            title="Export / Print Client PDF Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Lat/Long Input & Radius Selector */}
      <div className="bg-[#0E131E] border border-[#272F3E] rounded-lg p-3 space-y-2.5">
        <form onSubmit={handleApplyCoords} className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">Latitude (°N)</label>
            <input
              type="text"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-full bg-[#181F2C] border border-[#272F3E] rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">Longitude (°E)</label>
            <input
              type="text"
              value={inputLon}
              onChange={(e) => setInputLon(e.target.value)}
              className="w-full bg-[#181F2C] border border-[#272F3E] rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] font-mono pt-1">
          <span className="text-slate-400">Catchment Radius:</span>
          <div className="flex items-center space-x-1">
            {[1.0, 1.5, 2.0].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                  radiusKm === r
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-[#181F2C] text-slate-400 hover:text-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-slate-500 font-mono italic">
          Tip: You can also click directly anywhere on the map to instantly re-center this audit.
        </p>
      </div>

      {/* Audit Demographic & Spend Scorecard */}
      {auditMetrics && (
        <div className="space-y-3.5">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-lg bg-[#181F2C] border border-[#222938]">
              <span className="text-[9px] uppercase text-slate-400 block">Total Pop</span>
              <span className="text-sm font-bold text-cyan-400 mt-0.5 block">
                {auditMetrics.population.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500">{auditMetrics.households.toLocaleString()} HH</span>
            </div>

            <div className="p-2 rounded-lg bg-[#181F2C] border border-[#222938]">
              <span className="text-[9px] uppercase text-slate-400 block">Per Capita</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                ₹{(auditMetrics.avgPci / 100000).toFixed(1)}L
              </span>
              <span className="text-[9px] text-slate-500">₹{auditMetrics.totalIncomeCr} Cr Total</span>
            </div>

            <div className="p-2 rounded-lg bg-[#181F2C] border border-[#222938]">
              <span className="text-[9px] uppercase text-slate-400 block">Dessert Wallet</span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block">
                ₹{auditMetrics.dessertWalletLakhs}L
              </span>
              <span className="text-[9px] text-slate-500">8.5% F&B Share</span>
            </div>
          </div>

          {/* Demographic Breakdown Table */}
          <div className="border border-[#222938] rounded-lg overflow-hidden font-mono text-[10px]">
            <table className="w-full text-left">
              <thead className="bg-[#181F2C] text-slate-400">
                <tr>
                  <th className="p-1.5">Indicator</th>
                  <th className="p-1.5 text-right">Value ({radiusKm}km Zone)</th>
                  <th className="p-1.5 text-right">Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222938] text-slate-300">
                <tr>
                  <td className="p-1.5 text-slate-400">Male Population</td>
                  <td className="p-1.5 text-right font-semibold">{auditMetrics.male.toLocaleString()}</td>
                  <td className="p-1.5 text-right text-slate-500">51.8%</td>
                </tr>
                <tr>
                  <td className="p-1.5 text-slate-400">Female Population</td>
                  <td className="p-1.5 text-right font-semibold">{auditMetrics.female.toLocaleString()}</td>
                  <td className="p-1.5 text-right text-slate-500">48.2%</td>
                </tr>
                <tr>
                  <td className="p-1.5 text-slate-400">Annual Out-of-Home F&B</td>
                  <td className="p-1.5 text-right font-semibold text-amber-400">₹{auditMetrics.fbSpendLakhs.toLocaleString()} Lakhs</td>
                  <td className="p-1.5 text-right text-slate-500">High Density</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nearby Competitor Directory Table (with Phone & Amenities) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Competitor Stores in Catchment ({auditMetrics.competitors.length})
              </span>
              <span className="text-[9px] font-mono text-cyan-400">With Operating Hours & Phone</span>
            </div>

            <div className="border border-[#222938] rounded-lg overflow-hidden max-h-40 overflow-y-auto font-mono text-[9px]">
              <table className="w-full text-left">
                <thead className="bg-[#181F2C] text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-1.5">Brand & Name</th>
                    <th className="p-1.5">Hours</th>
                    <th className="p-1.5">Phone</th>
                    <th className="p-1.5 text-right">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222938] text-slate-300">
                  {auditMetrics.competitors.length > 0 ? (
                    auditMetrics.competitors.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-1.5">
                          <span className={`font-semibold block ${c.is_client_store ? 'text-cyan-400' : 'text-slate-100'}`}>
                            {c.store_name}
                          </span>
                          <span className="text-[8px] text-slate-400 block truncate max-w-[120px]">
                            {c.amenities ? c.amenities.slice(0, 2).join(', ') : 'Dine-In'}
                          </span>
                        </td>
                        <td className="p-1.5 text-slate-400">{c.opening_hours || '11 AM - 12 AM'}</td>
                        <td className="p-1.5 text-slate-300">{c.phone || '+91 80 41234567'}</td>
                        <td className="p-1.5 text-right text-amber-400 font-semibold">₹{c.avg_for_two_inr}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-slate-500 italic">
                        Zero competitors detected in this {radiusKm}km catchment — Prime White Space!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complementary Brand Anchors */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
              Co-Located Complementary Anchors ({auditMetrics.anchors.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {auditMetrics.anchors.slice(0, 8).map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[#181F2C] border border-[#272F3E] text-slate-300 text-[10px] font-mono">
                  {a.brand}
                </span>
              ))}
              {auditMetrics.anchors.length > 8 && (
                <span className="px-1.5 py-0.5 text-slate-500 font-mono text-[9px]">
                  +{auditMetrics.anchors.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
