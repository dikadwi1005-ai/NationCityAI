/** Local visual time only. No Date, election, authentication, persistence or server-clock dependency. */
export class LocalWorldClock{
 hour=10;paused=false;minutesPerSecond=2;
 advance(seconds:number){if(!this.paused&&Number.isFinite(seconds)&&seconds>0)this.hour=(this.hour+Math.min(seconds,.25)*this.minutesPerSecond/60)%24;return this.sample()}
 setHour(hour:number){if(!Number.isFinite(hour))throw Error('Jam tidak valid.');this.hour=((hour%24)+24)%24}
 setSpeed(speed:number){if(![.5,2,10,30,120].includes(speed))throw Error('Kecepatan tidak didukung.');this.minutesPerSecond=speed}
 sample(){const angle=(this.hour-6)/24*Math.PI*2,elevation=Math.sin(angle),day=Math.max(0,Math.min(1,(elevation+.08)/.28)),night=1-day,twilight=Math.max(0,1-Math.abs(elevation)/.24);return{hour:this.hour,elevation,day,night,twilight,sun:[Math.cos(angle)*150,elevation*170,Math.sin(angle*.6)*85] as[number,number,number],paused:this.paused,minutesPerSecond:this.minutesPerSecond}}
}
export const localWorldClock=new LocalWorldClock();
