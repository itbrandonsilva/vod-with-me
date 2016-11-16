import { SyncService, Message, VODDescription } from './../sync.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
    private id: string;
    private isHost: boolean;
    private routeSubscription: Subscription;
    private messagesSubscription: Subscription;
    private vodDescription: VODDescription;

    constructor(private activatedRoute: ActivatedRoute, private syncService: SyncService) {
        this.routeSubscription = activatedRoute.params.subscribe(params => {
            let id = params['id'];
            id ? this.syncService.joinRoom(id) : null;
        });

        console.log('SUBSCRIBE');
        this.messagesSubscription = this.syncService.messages.subscribe({
            next: (message: Message) => {
                switch (message.name) {
                    case 'ELECTED_HOST':
                        this.isHost = true;
                        break;
                    case 'REVOKED_HOST':
                        this.isHost = false;
                        break;
                    case 'VOD_DESCRIPTION':
                        console.log(message.data);
                        this.vodDescription = message.data;
                        break;
                }
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
        this.messagesSubscription.unsubscribe();
    }
}