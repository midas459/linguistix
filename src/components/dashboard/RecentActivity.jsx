import { Award, Layers, Play } from "lucide-react";
import { relativeTime } from "@/lib/dates";

const ICONS = { lesson: Play, cards: Layers, badge: Award };

export default function RecentActivity({ activity }) {
  const items = activity.slice(0, 3);

  return (
    <article className="dh4-card dh4-recent" style={{ "--dh4-j": 4 }}>
      <h3 className="dh4-h3">Recent</h3>
      {items.length === 0 ? (
        <div className="dh4-empty-recent">
          <p>
            Nothing here yet.
            <br />
            Finish a lesson and it shows up.
          </p>
        </div>
      ) : (
        <ul className="dh4-list">
          {items.map((item, i) => {
            const Icon = ICONS[item.type] ?? Play;
            return (
              <li key={item.id}>
                <div className="dh4-row" style={{ "--dh4-j": i }}>
                  <span className="dh4-tile" aria-hidden="true">
                    <Icon strokeWidth={1.7} />
                  </span>
                  <span className="dh4-item-body">
                    <span className="dh4-item-title">{item.title}</span>
                    <span className="dh4-item-text">
                      {item.detail} · {relativeTime(item.at)}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}