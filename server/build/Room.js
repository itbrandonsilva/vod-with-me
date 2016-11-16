"use strict";
var PlayerState = (function () {
    function PlayerState() {
    }
    return PlayerState;
}());
var Room = (function () {
    function Room(id, member) {
        this.id = id;
        this.members = new Map();
        if (member)
            this.addMember(member);
    }
    Room.prototype.addMember = function (member) {
        var _this = this;
        this.members.set(member.id, member);
        this.syncMember(member);
        member.on('disconnect', function () {
            _this.removeMember(member);
        });
        if (!this.host)
            this.electHost();
    };
    Room.prototype.hostEmit = function (name, data) {
        this.members.forEach(function (member, id) { return member.emit(name, data); });
    };
    Room.prototype.syncMember = function (member) {
        if (!this.playerState)
            return;
        member.emit('VOD_DESCRIPTION', { service: this.playerState.service, id: this.playerState.id });
        member.emit('CMD_SET_TIME', this.playerState.time + (this.playerState.since.getTime() / 1000));
        member.emit(this.playerState.status);
    };
    Room.prototype.electHost = function () {
        var _this = this;
        if (!this.members.size)
            return;
        var first = this.members.entries().next();
        var host = this.members.get(first.value[0]);
        //let first = this.members.entries()[0];
        //let host = this.members.get(first[0]);
        host.emit('ELECTED_HOST');
        ['CMD_PAUSE', 'CMD_PLAY', 'CMD_SET_TIME', 'VOD_DESCRIPTION'].forEach(function (cmd) {
            host.on(cmd, function (data) {
                if (['CMD_PAUSE', 'CMD_PLAY'].indexOf(cmd) > -1) {
                    _this.playerState.status = cmd;
                    _this.playerState.time = data;
                    _this.playerState.since = new Date();
                }
                if (cmd === 'CMD_SET_TIME') {
                    _this.playerState.time = data;
                    _this.playerState.since = new Date();
                }
                if (cmd === 'VOD_DESCRIPTION') {
                    _this.playerState = new PlayerState();
                    _this.playerState.status = 'CMD_PAUSE';
                    _this.playerState.service = data.service;
                    _this.playerState.id = data.id;
                    _this.playerState.time = 0;
                    _this.playerState.since = new Date();
                    return _this.members.forEach(function (member, id) { return _this.syncMember(member); });
                }
                _this.hostEmit(cmd, data);
            });
        });
        host.on('disconnect', function () {
            _this.electHost();
        });
        this.host = host;
    };
    Room.prototype.removeMember = function (member) {
        this.members.delete(member.id);
        if (this.members.size <= 0)
            this.cleanUp();
    };
    Room.prototype.onEmpty = function (cb) {
        this._onEmpty = cb;
    };
    Room.prototype.cleanUp = function () {
        if (this._onEmpty)
            this._onEmpty();
    };
    return Room;
}());
exports.Room = Room;
