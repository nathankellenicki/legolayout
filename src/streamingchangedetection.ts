import { EventEmitter } from "events";

export default class StreamingChangeDetection extends EventEmitter {

    private sampleSize: number;
    private numChanges: number;
    private diffPercentage: number;

    private data: number[];
    private deviations: number[];

    constructor (sampleSize: number, numChanges: number, diffPercentage: number) {
        super();
        this.sampleSize = sampleSize;
        this.numChanges = numChanges;
        this.diffPercentage = diffPercentage;
        this.data = [];
        this.deviations = [];
    }

    public add (num: number) {
        this.data.push(num);
        if (this.data.length >= this.sampleSize + 1) {
            this.data = this.data.slice(1);
        }
        if (this.data.length >= this.sampleSize) {
            const dev = StreamingChangeDetection.Deviation(this.data, 0);
            this.deviations.push(dev);
        }
        if (this.deviations.length >= this.numChanges) {
            const avgDev = StreamingChangeDetection.Average(this.deviations);
            this.deviations = [];

            if ((avgDev / num * 100) > this.diffPercentage) {
                this.emit("detect", avgDev);
            }
        }
    }

    private static Average (data: number[]) {
        return data.reduce((a, b) => a + b) / data.length;
    }

    private static Deviation (data: number[], trim = 0) {
        let sortedData = [...data].sort((a, b) => a - b);
        sortedData = sortedData.slice(0, sortedData.length - trim).slice(trim);
        const basicAvg = StreamingChangeDetection.Average(sortedData);
        const diffs = sortedData.map((val) => {
            const diff = val - basicAvg;
            const sqr = diff * diff;
            return sqr;
        });
        const diffAvg = StreamingChangeDetection.Average(diffs);
        return Math.sqrt(diffAvg);
    }

}