//% color=190 weight=100 icon="\uf1ec" block="Discovery Spot"
//% groups=['LED matrix', 'Control flow', 'others']
namespace discoveryspot {
    let proxAddr = 0x13
    let tempAddr = 54

    const IR_DEFAULT = 0x13
    const IR_COMMAND = 0x80
    const IR_PRODUCTID = 0x81
    const IR_PROXRATE = 0x82
    const IR_IRLED = 0x83
    const IR_AMBIENTPARAMETER = 0x84
    const IR_AMBIENTDATA = 0x85
    const IR_PROXIMITYDATA = 0x87
    const IR_INTCONTROL = 0x89
    const IR_PROXINITYADJUST = 0x8A
    const IR_INTSTAT = 0x8E
    const IR_MODTIMING = 0x8F
    const IR_MEASUREAMBIENT = 0x10
    const IR_MEASUREPROXIMITY = 0x08
    const IR_AMBIENTREADY = 0x40
    const IR_PROXIMITYREADY = 0x20
    const IR_AMBIENT_LUX_SCALE = 0.25
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
        basic.pause(10)
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
        basic.pause(10)
        return humidity
    }

    function readU8(addr: number, command: number): number {
        basic.pause(1)
        pins.i2cWriteNumber(addr, command, NumberFormat.UInt8BE, false)
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
    }

    function writeU8(addr: number, command: number, value: number) {
        basic.pause(1)
        pins.i2cWriteNumber(addr, (command << 8) + value, NumberFormat.UInt16BE, false)
        //pins.i2cWriteNumber(addr, value, NumberFormat.UInt8BE, false)
    }

    function readU16(addr: number, command: number): number {
        let highByte = readU8(addr, command)
        let lowByte = readU8(addr, command + 1)
        return (highByte << 8) + lowByte
    }

    //% block
    export function InitProximitySensor(): boolean {
        basic.pause(1000)
        let revision = readU8(IR_DEFAULT, IR_PRODUCTID)
        if ((revision & 0xF0) != 0x20) {
            return false
        } else {
            writeU8(IR_DEFAULT, IR_IRLED, 20)
            // let timing = readU8(IR_DEFAULT, IR_MODTIMING)
            // timing &= ~0b00011000
            // timing |= (3 << 3) & 0xFF
            // writeU8(IR_DEFAULT, IR_MODTIMING, timing)
            writeU8(IR_DEFAULT, IR_INTCONTROL, 0x08)
            return true
        }
    }

    //% block
    export function ReadProximity(): number {
        let status = readU8(IR_DEFAULT, IR_INTSTAT)
        status &= ~0x80
        writeU8(IR_DEFAULT, IR_INTSTAT, status)

        writeU8(IR_DEFAULT, IR_COMMAND, IR_MEASUREPROXIMITY)
        for (let x = 0; x < 50; x++) {
            basic.pause(1)
            let result = readU8(IR_DEFAULT, IR_COMMAND)
            if (result & IR_PROXIMITYREADY) {
                return readU16(IR_DEFAULT, IR_PROXIMITYDATA)
            }
        }
        return 0
    }

    //% block
    export function ReadLight(): number {
        let status = readU8(IR_DEFAULT, IR_INTSTAT)
        status &= ~0x80
        writeU8(IR_DEFAULT, IR_INTSTAT, status)

        writeU8(IR_DEFAULT, IR_COMMAND, IR_MEASUREAMBIENT)
        for (let x = 0; x < 50; x++) {
            basic.pause(1)
            let result = readU8(IR_DEFAULT, IR_COMMAND)
            if (result & IR_AMBIENTREADY) {
                return readU16(IR_DEFAULT, IR_AMBIENTDATA)
            }
        }
        return 0
    }

    function sendLED0() {
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(0.36)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(0.81)
    }

    function sendLED1() {
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(0.71)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(0.61)
    }

    function sendLEDReset() {
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(100)
    }

    function shiftOut(numberToShift: number) {
        let us_to_delay = 0
        numberToShift &= 0xFF
        for (let x = 0; x < 8; x++) {
            if ((numberToShift & (0x01 << x)) > 1) {
                sendLED1()
            } else {
                sendLED0()
            }
        }
    }

    //% block
    export function SendLEDColor(redVal: number, greenVal: number, blueVal: number): void {
        sendLEDReset()
        for (let x = 0; x < 24; x++) {
            sendLED0()
        }
        sendLEDReset()
    }
} 