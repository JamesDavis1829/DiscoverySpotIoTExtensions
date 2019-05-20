
//% color=190 weight=100 icon="\uf1ec" block="Discovery Spot"
//% groups=['LED matrix', 'Control flow', 'others']
namespace discoveryspot {
    let proxAddr = 0x13
    let tempAddr = 54

    //% block
    export function ReadTemperature(): number {
        let temp = 0
        pins.i2cWriteNumber(
            tempAddr,
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

    //% block
    export function ReadHumidity(): number {
        let humidity = 0
        pins.i2cWriteNumber(
            tempAddr,
            3856,
            NumberFormat.UInt16BE,
            false
        )
        basic.pause(5)
        humidity = pins.i2cReadNumber(54, NumberFormat.UInt16BE, false)
        basic.pause(100)
        return humidity
    }

    //% block
    export function InitProximitySensor(): boolean {
        pins.i2cWriteNumber(proxAddr, 0x81, NumberFormat.UInt8BE, false)
        let id = pins.i2cReadNumber(proxAddr, NumberFormat.UInt8BE)
        if ((id & 0xF0) != 0x20) {
            return false;
        } else {
            return true
        }
    }
} 