// ref: https://github.com/projectsbydan/react-time-heatmap

import styles from "./index.module.css";

const hours: string[] = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
];

export interface ITimeEntry {
  time: Date;
  count: number;
  users: string[];
}

export interface ITimeHeapMapProps {
  timeEntries: ITimeEntry[];
  showCounts?: boolean;
  flow?: boolean;
  numberOfGroups?: number;
  textForNoTimeEntries?: string;
  showGroups?: boolean;
  showHours?: boolean;
}

export const TimeHeatMap = (props: ITimeHeapMapProps) => {
  if (props.timeEntries.length === 0) {
    return <div>{props.textForNoTimeEntries || "No time entries"}</div>;
  }

  const timeEntries = props.timeEntries
    .sort((a, b) => (a.time < b.time ? -1 : 1))
    .slice()
    .sort((a, b) => (a.time.getHours() < b.time.getHours() ? -1 : 1));

  const numberOfDays = (timeEntries.length / 24) | 0;

  const maxCount = Math.max(...timeEntries.map((x) => x.count));
  const numberOfGroups = props.numberOfGroups || 4;
  const limits: number[] = [];
  for (let i = 1; i <= numberOfGroups; i++) {
    limits.push(((maxCount / numberOfGroups) * i) | 0);
  }

  const getGroupNumber = (value: number) => {
    for (let i = 0; i < limits.length; i++) {
      const limit = limits[i];
      if (!limit) continue;

      if (value <= limit) {
        return i + 1;
      }
    }

    return 0;
  };

  const getEntryClassName = (entry: ITimeEntry) => {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const styleTimeEntry = styles?.["timeEntry"];
    if (!styleTimeEntry) return;

    const classes: string[] = [styleTimeEntry];

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const styleHasValue = styles?.["hasValue"];
    if (!styleHasValue) return;

    if (entry.count !== 0) {
      classes.push(styleHasValue);
    }

    return classes.join(" ");
  };

  const getMainClassName = () => {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const styleTimeHeatMap = styles?.["timeHeatMap"];
    if (!styleTimeHeatMap) return;

    const classes: string[] = [styleTimeHeatMap];
    if (props.flow) {
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      const styleFlow = styles?.["flow"];
      if (!styleFlow) return;
      classes.push(styleFlow);
    }

    return classes.join(" ");
  };

  return (
    <section className={getMainClassName()}>
      {/* biome-ignore lint/complexity/useLiteralKeys: <explanation> */}
      <div className={styles["mapContainer"]}>
        <article
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          className={styles["map"]}
          style={{ gridTemplateColumns: `repeat(${numberOfDays},1fr)` }}
        >
          {timeEntries.map((x, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              title={`count:${x.count} users:${x.users.join(", ")}
              `}
              className={getEntryClassName(x)}
              style={{
                opacity: (1 / numberOfGroups) * getGroupNumber(x.count),
              }}
            >
              {props.showCounts ? x.count : null}
            </div>
          ))}
        </article>
        {props.showHours !== false ? (
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          <article className={styles["hours"]}>
            {hours.map((x) => (
              <div key={x}>{x}</div>
            ))}
          </article>
        ) : null}
      </div>
      {props.showGroups !== false ? (
        <article
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          className={styles["legend"]}
          style={{ gridTemplateColumns: `repeat(${numberOfGroups}, 1fr)` }}
        >
          {limits.map((x, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i}>
              <div
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                className={styles["legendEntry"]}
                style={{ opacity: (1 / numberOfGroups) * (i + 1) }}
              />
              {x}
            </div>
          ))}
        </article>
      ) : null}
    </section>
  );
};
