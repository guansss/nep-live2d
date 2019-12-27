<template>
    <div class="log">
        <div class="buttons">
            <div class="button" @click="runCommand">{{ $t('cmd') }}</div>
            <div class="button" @click="dumpLogs">{{ $t('dump_logs') }}</div>
            <div class="button" @click="dumpStorage">{{ $t('dump_storage') }}</div>

            <LongClickAction class="button reset" :duration="1500" @long-click="reset">{{
                $t('reset')
            }}</LongClickAction>
        </div>

        <table class="table">
            <tr v-for="(log, i) in logs" :key="i" :class="['row', { error: log.error }]">
                <th v-if="log.rowSpan" :rowspan="log.rowSpan" :style="{ backgroundColor: log.color }">{{ log.tag }}</th>
                <td>{{ log.count > 1 ? `${log.message} (x${log.count})` : log.message }}</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import ConsoleSVG from '@/assets/img/console.svg';
import { error, log, LogRecord, logs as _logs } from '@/core/utils/log';
import { randomHSLColor } from '@/core/utils/string';
import ConfigModule from '@/module/config/ConfigModule';
import LongClickAction from '@/module/config/reusable/LongClickAction.vue';
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
    components: { LongClickAction, Scrollable },
})
export default class ConsoleSettings extends Vue {
    static readonly ICON = ConsoleSVG;
    static readonly TITLE = 'console';

    @Prop() readonly configModule!: ConfigModule;

    logs: ExtendedLogRecord[] = [];

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

    runCommand() {
        const cmd = prompt('Run command', '');

        if (cmd) {
            log('CMD', '> ' + cmd);

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
            try {
                log(
                    'CMD',
                    Function('"use strict";return (function(app){return (' + cmd + ')})')()(this.configModule.app),
                );
            } catch (e) {
                error('CMD', e);
            }
        }
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

    reset() {
        this.configModule.app.emit('reset');
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
    background #e72917 !important

    &:hover
        background #cf1100 !important

    >>> .progress
        background #FFF8 !important

.table
    width 100%
    color #000
    font .8em / 1.2em Consolas, monospace
    border-collapse collapse
    box-shadow inset 0 0 4px #666

    th
        width 80px
        padding 0 2px
        color #FFF
        font-weight normal
        text-align right
        white-space pre-wrap
        border-bottom 1px solid #FFF1

    td
        padding 0 2px
        white-space pre-wrap
        word-break break-word
        border-bottom 1px solid #0001

.error
    td
        color #c0392b
        font-weight bold
</style>
