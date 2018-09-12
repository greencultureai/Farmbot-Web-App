import * as React from "react";
import { Saucer } from "../../../ui/index";
import { t } from "i18next";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { last, isNumber } from "lodash";
import { Content } from "../../../constants";
import { FbosDetailsProps } from "./interfaces";

export const colorFromTemp = (temp: number | undefined): string => {
  if (!temp) {
    return "gray";
  }
  if (temp < 0) {
    return "lightblue";
  } else if (temp < 10) {
    return "blue";
  } else if (temp > 75) {
    return "red";
  } else if (temp > 60) {
    return "yellow";
  } else {
    return "green";
  }
};

export function ChipTemperatureDisplay({ chip, temperature }: {
  chip?: string, temperature: number | undefined
}): JSX.Element {
  return <div className="chip-temp-display">
    <p>
      <b>{chip && chip.toUpperCase()} {t("CPU temperature")}: </b>
      {temperature ? <span>{temperature}&deg;C</span> : t("unknown")}
    </p>
    {<Saucer color={colorFromTemp(temperature)} className={"small-inline"} />}
  </div>;
}

export function WiFiStrengthDisplay({ wifiStrength }: {
  wifiStrength: number | undefined
}): JSX.Element {
  const percent = wifiStrength
    ? Math.round(-0.0154 * wifiStrength ** 2 - 0.4 * wifiStrength + 98)
    : 0;
  const dbString = `${wifiStrength || 0}dBm`;
  const percentString = `${percent}%`;
  return <div className="wifi-strength-display">
    <p>
      <b>{t("WiFi Strength")}: </b>
      {wifiStrength ? dbString : "N/A"}
    </p>
    {wifiStrength &&
      <div className="percent-bar">
        <div
          className="percent-bar-fill"
          style={{ width: percentString }}
          title={dbString} />
      </div>}
  </div>;
}

export function FbosDetails(props: FbosDetailsProps) {
  const { dispatch, sourceFbosConfig, botInfoSettings } = props;
  const {
    env, commit, target, node_name, firmware_version, firmware_commit,
    soc_temp, wifi_level, uptime, memory_usage, disk_usage
    // TODO: remove `as any` in the next line (& tests) when FBJS is published.
    // tslint:disable-next-line:no-any
  } = botInfoSettings as any;
  const betaOptIn = sourceFbosConfig("beta_opt_in");
  const shortenCommit = (longCommit: string) => (longCommit || "").slice(0, 8);
  return <div>
    <p><b>Environment: </b>{env}</p>
    <p><b>Commit: </b>
      <a href={"https://github.com/FarmBot/farmbot_os/tree/" + shortenCommit(commit)}>
        {shortenCommit(commit)}</a>
    </p>
    <p><b>Target: </b>{target}</p>
    <p><b>Node name: </b>{last((node_name || "").split("@"))}</p>
    <p><b>Firmware: </b>{firmware_version}</p>
    <p><b>Firmware commit: </b>{shortenCommit(firmware_commit)}</p>
    {isNumber(uptime) && <p><b>Uptime: </b>{uptime}s</p>}
    {isNumber(memory_usage) && <p><b>Memory usage: </b>{memory_usage}MB</p>}
    {isNumber(disk_usage) && <p><b>Disk usage: </b>{disk_usage}%</p>}
    <ChipTemperatureDisplay chip={target} temperature={soc_temp} />
    <WiFiStrengthDisplay wifiStrength={wifi_level} />
    <fieldset>
      <label style={{ marginTop: "0.75rem" }}>
        {t("Beta release Opt-In")}
      </label>
      <ToggleButton
        toggleValue={betaOptIn.value}
        dim={!betaOptIn.consistent}
        toggleAction={() =>
          (betaOptIn.value || confirm(Content.OS_BETA_RELEASES)) &&
          dispatch(updateConfig({ beta_opt_in: !betaOptIn.value }))} />
    </fieldset>
  </div>;
}