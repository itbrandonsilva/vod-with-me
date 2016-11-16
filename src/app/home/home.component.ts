import { SyncService } from './../sync.service';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    private id: string;
    private vodId: string;
    constructor(private router: Router, private syncService: SyncService) { }

    ngOnInit() {
    }

    joinRoom(): void {
        console.log('joinRoom');
        this.router.navigate([`/room/${this.id}`]);
    }

    createRoom(): void {
        this.syncService.createRoom({service: 'twitch', id: this.vodId}).then(() => {
            this.id = this.syncService.roomId;
            this.joinRoom();
        });
    }
}
