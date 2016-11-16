import { Subscription } from 'rxjs/Rx';
import { SyncService, Message, VODDescription } from './../sync.service';
import { Component, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-twitch-embed',
  templateUrl: './twitch-embed.component.html',
  styleUrls: ['./twitch-embed.component.css']
})
export class TwitchEmbedComponent implements AfterViewInit {
    @Input() type: string = 'video';
    @Input() desc: VODDescription;

    private player: any;
    private messagesSubscription: Subscription;

    constructor(private syncService: SyncService) {
        this.messagesSubscription = this.syncService.messages.subscribe((msg: Message) => {
            switch (msg.name) {
                case 'CMD_PLAY':
                    this.player.play();
                    break;
                case 'CMD_PAUSE':
                    this.player.seek(msg.data);
                    this.player.pause();
                    break;
                case 'CMD_SET_TIME':
                    this.player.seek(msg.data);
                    break;
            }
        });
    }

    emit(cmd: string, data: any) {
        this.syncService.emit(cmd, data);
    }

    ngAfterViewInit() {
        console.log(this.desc);
        var options = {
            width: 854,
            height: 480,
            //channel: "{CHANNEL}", 
            video: this.desc.id,
            autoplay: false,
        };
        this.player = new Twitch.Player("embed", options);
        this.player.setVolume(0.5);
        this.player.addEventListener(Twitch.Player.PAUSE, () => {
            this.emit('CMD_PAUSE', this.player.getCurrentTime());
        });

        this.player.addEventListener(Twitch.Player.PLAY, () => {
            this.emit('CMD_PLAY', this.player.getCurrentTime());
        })

        let seek = this.player.seek;
        this.player.seek = function () {
            console.log('SEEK');
            seek(arguments);
        }.bind(this.player);
    }

}