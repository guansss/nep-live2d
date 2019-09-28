<template>
    <div class="log">
        <div class="button" @click="dumpLogs">Dump Logs</div>
        <div class="button" @click="dumpConfig">Dump Config</div>
        <table class="table">
            <tr v-for="(log, i) in logs" :key="i" :class="['row', { error: log.error }]">
                <td v-if="log.rowSpan" :rowspan="log.rowSpan" class="tag" :style="{ backgroundColor: log.color }">
                    {{ log.count > 1 ? `${log.tag} (x${log.count})` : log.tag }}
                </td>
                <td class="message">{{ log.message }}</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import { LogRecord, logs as _logs } from '@/core/utils/log';
import { randomHSLColor } from '@/core/utils/string';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

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
export default class LogSettings extends Vue {
    static title = 'LOG';

    logs: ExtendedLogRecord[] = [];

    private created() {
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

    dumpConfig() {
        const data = JSON.stringify(localStorage.config);
        prompt('Dump result', data);
    }

    private beforeDestroy() {
        logs.push = originalPush;
    }
}
</script>

<style scoped lang="stylus">
.log
    padding 16px

.button
    margin-right 8px

.table
    color #000
    font .8em / 1.2em Consolas, monospace
    border-collapse collapse
    box-shadow inset 0 0 4px #666

.tag
    overflow hidden
    color #FFF
    resize horizontal

.message
    flex-grow 1
    white-space pre-wrap
    border-bottom 1px solid #0001

.error
    .message
        color #c0392b
</style>
