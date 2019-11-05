<template>
    <div class="log">
        <div class="buttons">
            <div class="button" @click="dumpLogs">Dump Logs</div>
            <div class="button" @click="dumpStorage">Dump Storage</div>
            <div
                class="button reset"
                @mousedown.stop="resetStart"
                @mouseup.stop="resetCancel"
                @mouseleave="resetCancel"
            >
                Reset
                <div
                    v-if="resetProgress > 0"
                    class="cover"
                    :style="{ transform: `translateX(${(resetProgress - 1) * 100}%)` }"
                ></div>
            </div>
        </div>

        <table class="table">
            <tr v-for="(log, i) in logs" :key="i" :class="['row', { error: log.error }]">
                <td v-if="log.rowSpan" :rowspan="log.rowSpan" class="tag" :style="{ backgroundColor: log.color }">
                    {{ log.tag }}
                </td>
                <td class="message">{{ log.count > 1 ? `${log.message} (x${log.count})` : log.message }}</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import ConsoleSVG from '@/assets/img/console.svg';
import { log, LogRecord, logs as _logs } from '@/core/utils/log';
import { randomHSLColor } from '@/core/utils/string';
import ConfigModule from '@/module/config/ConfigModule';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

export interface ExtendedLogRecord extends LogRecord {
    rowSpan: number;
    color?: string;
}

const logs = (_logs as any) as ExtendedLogRecord[] & typeof _logs;

const originalPush = logs.push;

function setColor(log: ExtendedLogRecord) {
    if (!cachedColors[log.tag]) {
        cachedColors[log.tag] = randomHSLColor(log.tag, '40%', '50%');
    }
    log.color = cachedColors[log.tag];
}

const cachedColors: { [key: string]: string } = {};
@Component({
    components: { Scrollable },
})
export default class ConsoleSettings extends Vue {
    static readonly ICON = ConsoleSVG;
    static readonly TITLE = 'console';

    @Prop() readonly configModule!: ConfigModule;

    logs: ExtendedLogRecord[] = [];

    resetTime = 2000; // time required to press and hold the button to reset
    resetProgress = 0; // 0 ~ 1
    resetRafID = -1; // ID returned by requestAnimationFrame()

    created() {
        // initialize logs for displaying
        for (let i = 0; i < logs.length; i++) {
            const thisLog = logs[i];
            const nextLog = logs[i + 1];

            thisLog.rowSpan = thisLog.rowSpan || 1;

            if (nextLog && nextLog.tag === thisLog.tag) {
                nextLog.rowSpan = thisLog.rowSpan + 1;
                thisLog.rowSpan = 0;
            } else {
                setColor(thisLog);
            }
        }

        // copy logs as reversed array to display them by newest order
        this.logs = logs.slice().reverse() as ExtendedLogRecord[];

        let lastLog: ExtendedLogRecord;

        logs.push = (log: ExtendedLogRecord) => {
            lastLog = logs[logs.length - 1] as ExtendedLogRecord;

            originalPush.call(logs, log);

            // update only if array was not changed by originalPush()
            if (lastLog !== logs[logs.length - 1]) {
                if (this.logs.length === logs.limit) {
                    this.logs.pop();
                }

                if (lastLog.tag === log.tag) {
                    log.rowSpan = lastLog.rowSpan + 1;
                    lastLog.rowSpan = 0;
                } else {
                    log.rowSpan = 1;
                }

                setColor(log);
                this.logs.unshift(log);
            }

            return logs.length;
        };
    }

    dumpLogs() {
        const data = logs.reduce((result, log) => `${result}##[${log.tag}]${log.message}`, '').replace('\n', '##');
        prompt('Dump result', data);
    }

    dumpStorage() {
        // print to console
        Object.entries(localStorage).forEach(([key, value]) => log(`Storage[${key}]`, value));

        prompt(
            'Dump result',
            Object.entries(localStorage)
                .map(([key, value]) => `${key}:${value}`)
                .join('##'),
        );
    }

    resetStart() {
        // ensure there is no active animation
        if (this.resetRafID === -1) {
            this.resetProgress = 0;

            const startTime = performance.now();

            // make animation
            const tick = (now: DOMHighResTimeStamp) => {
                this.resetProgress = (now - startTime) / this.resetTime;

                if (this.resetProgress > 1) {
                    this.resetRafID = -1;
                    this.reset();
                } else {
                    this.resetRafID = requestAnimationFrame(tick);
                }
            };

            tick(startTime);
        }
    }

    private resetCancel() {
        this.resetProgress = 0;

        if (this.resetRafID != -1) cancelAnimationFrame(this.resetRafID);
        this.resetRafID = -1;
    }

    reset() {
        this.configModule.app.emit('reset');

        // this method can also be used to clean up
        this.resetCancel();
    }

    beforeDestroy() {
        logs.push = originalPush;
    }
}
</script>

<style scoped lang="stylus">
.log
    padding 16px

.buttons
    display flex

.button
    margin-right 8px

.reset
    margin-right 0
    margin-left auto
    overflow hidden
    background #e72917

    &:hover
        background #cf1100

    .cover
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        background #FFF8

.table
    width 100%
    color #000
    font .8em / 1.2em Consolas, monospace
    border-collapse collapse
    box-shadow inset 0 0 4px #666

.tag
    color #FFF
    border-bottom 1px solid #FFF1

.message
    flex-grow 1
    white-space pre-wrap
    word-break break-word
    border-bottom 1px solid #0001

.error
    .message
        color #c0392b
</style>
