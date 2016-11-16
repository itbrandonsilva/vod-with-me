import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import * as sio from 'socket.io-client';
import { Subscription, Subject } from 'rxjs/Rx';

export interface Message {
    name: string;
    data?: any;
}

export interface VODDescription {
    service: string;
    type?: string;
    id?: string;
}

@Injectable()
export class SyncService {
    private socket: any;
    private subscription: Subscription;
    private isHosting: boolean;
    roomId: string;
    messages = new Subject<Message>();

    constructor(private activatedRoute: ActivatedRoute) {
    }

    leaveRoom() {
        if (this.socket) this.socket.disconnect();
    }

    joinRoom(id: string): void {
        if (this.roomId === id) return;
        this.leaveRoom();

        this.socket = sio(`http://192.168.1.6:3000`);
        this.socket.on('connect', () => {
            this.socket.emit('join', id);
            this.listen();
        });
    }

    handleMessage(cmd: string, data: any): void {
        console.log(cmd, data);
        this.messages.next({name: cmd, data});
    }

    createRoom(vodDescription: VODDescription): Promise<undefined> {
        this.leaveRoom();

        return new Promise((resolve, reject) => {
            this.socket = sio(`http://192.168.1.6:3000`);
            this.socket.on('connect', () => {
                this.socket.once('id', id => {
                    console.log('ID:', id);
                    this.roomId = id
                    resolve();
                });
                this.emit('create', vodDescription);
                this.listen();
                this.emit('VOD_DESCRIPTION', vodDescription);
                /*['CMD_PAUSE', 'CMD_PLAY', 'ELECTED_HOST'].forEach(cmd => {
                    this.socket.on((cmd, data) => {
                        switch (cmd) {
                            case 'CMD_PAUSE':
                                break;
                            case 'CMD_PAUSE':
                                break;
                        }
                    });
                })*/
            });
        });
    }

    listen() {
        this.socket.on('disconnect', () => {
            this.isHosting = false;
        });

        [
            'CMD_PAUSE',
            'CMD_PLAY',
            'VOD_DESCRIPTION',
            'ELECTED_HOST',
            'REVOKED_HOST'
        ].forEach(cmd => this.socket.on(cmd, (data) => {
            switch (cmd) {
                case 'ELECTED_HOST':
                    console.log('ELECTED');
                    this.isHosting = true;
                    return;
                case 'REVOKED_HOST':
                    this.isHosting = false;
                    return;
            }
            this.handleMessage(cmd, data);
        }));
    }


    emit(name: string, data: any): void {
        console.log(name, data);
        //if (this.isHosting) this.socket.emit(name, data);
        this.socket.emit(name, data);
    }
}
