/**
 * Public Profile page: Naveen's profile info plus the site's analytics
 * (launches/likes per app, like a small analytics page for this site).
 *
 * Visitor-facing, so every string goes through i18n. The numbers reuse
 * the admin chart helpers (buildChartData via profileStats, barWidth)
 * and the shared-stats rule from src/lib/stats.js: shared totals win
 * when /api/stats answers, otherwise this device's own counts.
 */

import { ArrowUpRight } from "lucide-react";
import { t } from "../lib/i18n.js";
import { formatCount } from "../lib/stats.js";
import { barWidth } from "../lib/adminTools.js";
import { profileStats } from "../lib/profile.js";

function ProfileBarChart({ rows, valueKey, color, label }) {
  const max = Math.max(0, ...rows.map((row) => row[valueKey]));
  const rowHeight = 30;
  const height = rows.length * rowHeight + 8;
  return (
    <svg
      className="analytics-chart"
      viewBox={`0 0 640 ${height}`}
      width="100%"
      role="img"
      aria-label={label}
    >
      {rows.map((row, index) => {
        const y = 8 + index * rowHeight;
        const width = (barWidth(row[valueKey], max) / 100) * 360;
        const name =
          row.name.length > 24 ? `${row.name.slice(0, 24)}…` : row.name;
        return (
          <g key={row.id}>
            <text x="8" y={y + 17} fontSize="13" fill="currentColor">
              {name}
            </text>
            <rect
              x="190"
              y={y + 4}
              width={row[valueKey] > 0 ? Math.max(width, 2) : 0}
              height="16"
              rx="4"
              fill={color}
            />
            <text x="562" y={y + 17} fontSize="13" fill="currentColor">
              {formatCount(row[valueKey])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProfileView({
  apps,
  launches,
  likes,
  shared,
  lang,
  socials,
}) {
  const { appCount, rows, totals, mostLaunched, newest } = profileStats(
    apps,
    launches,
    likes,
  );
  return (
    <div className="page-view profile-view">
      <h2>{t(lang, "navProfile")}</h2>
      <p className="profile-name">Naveen</p>
      <p className="page-lead">{t(lang, "aboutLead")}</p>
      <p>{t(lang, "aboutP1")}</p>
      <h3>{t(lang, "profileElsewhere")}</h3>
      <div className="profile-socials">
        {(socials || []).map((link) => (
          <a
            key={link.label}
            className="button button--quiet"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
      <h3>{t(lang, "profileAnalyticsTitle")}</h3>
      <p>{t(lang, "profileAnalyticsNote")}</p>
      <p className="profile-source">
        {shared
          ? t(lang, "profileSourceShared")
          : t(lang, "profileSourceLocal")}
      </p>
      <div className="analytics-totals">
        <div>
          <strong>{appCount}</strong>
          <span>{t(lang, "profileAppsCount")}</span>
        </div>
        <div>
          <strong>{formatCount(totals.launches)}</strong>
          <span>{t(lang, "profileTotalLaunches")}</span>
        </div>
        <div>
          <strong>{formatCount(totals.likes)}</strong>
          <span>{t(lang, "profileTotalLikes")}</span>
        </div>
        <div>
          <strong>{mostLaunched ? mostLaunched.name : "—"}</strong>
          <span>{t(lang, "profileMostLaunched")}</span>
        </div>
        <div>
          <strong>{newest ? newest.name : "—"}</strong>
          <span>{t(lang, "profileNewest")}</span>
        </div>
      </div>
      {totals.launches === 0 && totals.likes === 0 ? (
        <p className="admin-note">{t(lang, "profileEmpty")}</p>
      ) : (
        <div className="analytics-charts">
          <div>
            <h4>{t(lang, "profileLaunchesPerApp")}</h4>
            <ProfileBarChart
              rows={rows}
              valueKey="launches"
              color="#799e26"
              label={t(lang, "profileLaunchesPerApp")}
            />
          </div>
          <div>
            <h4>{t(lang, "profileLikesPerApp")}</h4>
            <ProfileBarChart
              rows={rows}
              valueKey="likes"
              color="#ff5d73"
              label={t(lang, "profileLikesPerApp")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
