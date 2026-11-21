const SOURCE_ERROR_LABEL: Record<string, string> = {
  payload_decode: "Payload Tidak Valid",
  device_id_mismatch: "ID Perangkat Tidak Cocok",
  payload_incomplete: "Data Sensor Tidak Lengkap",
  value_out_of_range: "Nilai Sensor Tidak Valid",
  invalid_event_type: "Tipe Event Tidak Dikenal",
}

const SOURCE_SENSOR_LABEL: Record<string, string> = {
  flame_sensor: "Sensor Api",
  mq2_sensor: "Sensor Asap",
  dht11: "Sensor Suhu",
  soil_sensor: "Sensor Tanah",
  heartbeat: "Heartbeat Perangkat",
}

const DEVICE_SOURCE_LABEL = "Perangkat"

export function resolveEventSourceLabel(source: string): string | null {
  const key = source.trim().toLowerCase()

  if (!key) return null

  if (key in SOURCE_ERROR_LABEL) {
    return SOURCE_ERROR_LABEL[key]
  }

  if (key in SOURCE_SENSOR_LABEL) {
    return SOURCE_SENSOR_LABEL[key]
  }

  if (key === "device") {
    return DEVICE_SOURCE_LABEL
  }

  return null
}
