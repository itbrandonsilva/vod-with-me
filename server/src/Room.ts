interface PlayerTime {
    time: number;
    since: number;
}

class PlayerState {
    status: string;
    time: number;
    since: Date;
    service: string;
    id: string;
}

export class Room {
    private host: any;
    private members: Map<string, any> = new Map<string, any>();
    private _onEmpty: any;
    private playerState: PlayerState;
    private playerTime: PlayerTime;

    constructor(private id: string, member: any) {
        if (member) this.addMember(member);
    }

    addMember(member: any): void {
        this.members.set(member.id, member);

        this.syncMember(member);

        member.on('disconnect', () => {
            this.removeMember(member);
        });
        if ( ! this.host ) this.electHost();
    }

    private hostEmit(name, data) {
        this.members.forEach((member, id) => member.emit(name, data));
    }

    private syncMember(member: any) {
        if ( ! this.playerState ) return;
        member.emit('VOD_DESCRIPTION', {service: this.playerState.service, id: this.playerState.id});
        member.emit('CMD_SET_TIME', this.playerState.time + (this.playerState.since.getTime()/1000));
        member.emit(this.playerState.status);
    }

    private electHost() {
        if ( ! this.members.size ) return;
        let first = this.members.entries().next();
        let host = this.members.get(first.value[0]);
        //let first = this.members.entries()[0];
        //let host = this.members.get(first[0]);

        host.emit('ELECTED_HOST');

        ['CMD_PAUSE', 'CMD_PLAY', 'CMD_SET_TIME', 'VOD_DESCRIPTION'].forEach(cmd => {
            host.on(cmd, (data: any) => {
                if (['CMD_PAUSE', 'CMD_PLAY'].indexOf(cmd) > -1) {
                    this.playerState.status = cmd;
                    this.playerState.time = data;
                    this.playerState.since = new Date();
                }

                if (cmd === 'CMD_SET_TIME') {
                    this.playerState.time = data;
                    this.playerState.since = new Date();
                }

                if (cmd === 'VOD_DESCRIPTION') {
                    this.playerState = new PlayerState();
                    this.playerState.status = 'CMD_PAUSE';
                    this.playerState.service = data.service;
                    this.playerState.id = data.id;
                    this.playerState.time = 0;
                    this.playerState.since = new Date();
                    return this.members.forEach((member, id) => this.syncMember(member));
                }

                this.hostEmit(cmd, data);
            });
        });

        host.on('disconnect', () => {
            this.electHost();
        });

        this.host = host;
    }

    removeMember(member: any) {
        this.members.delete(member.id);
        if (this.members.size <= 0) this.cleanUp();
    }

    private onEmpty(cb: any) {
        this._onEmpty = cb;
    }

    private cleanUp() {
        if (this._onEmpty) this._onEmpty();
    }
}
