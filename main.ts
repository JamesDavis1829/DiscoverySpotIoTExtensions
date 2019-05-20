namespace discoveryspot {
    export function ReadTemperature(): number {
        let temp = 0
        pins.i2cWriteNumber(
            54,
            4,
            NumberFormat.UInt16BE,
            false
        )
        basic.pause(5)
        temp = pins.i2cReadNumber(54, NumberFormat.UInt32BE, false)
        temp = temp & 0x3FFFFFFF
        temp = temp * 0.00001525878
        basic.pause(100)
        return temp
    }

    export function ReadHumidity(): number {
        let humidity = 0
        pins.i2cWriteNumber(
            54,
            3856,
            NumberFormat.UInt16BE,
            false
        )
        basic.pause(5)
        humidity = pins.i2cReadNumber(54, NumberFormat.UInt16BE, false)
        basic.pause(100)
        return humidity
    }
} 