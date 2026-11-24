import { Meeting } from "../domain/Meeting";
import { ScheduledMeeting } from "../domain/ScheduledMeeting";

export class StorageService {
  private static instance: StorageService | null = null;
  private meetings: Map<string, Meeting> = new Map();
  private scheduledMeetings: Map<string, ScheduledMeeting> = new Map();

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Meetings
  public saveMeeting(meeting: Meeting): void {
    this.meetings.set(meeting.name.toLowerCase(), meeting);
  }

  public getMeetingByName(name: string): Meeting | undefined {
    return this.meetings.get(name.toLowerCase());
  }

  public getMeetingById(id: string): Meeting | undefined {
    for (const m of this.meetings.values()) {
      if (m.id === id) return m;
    }
    return undefined;
  }

  public getAllMeetings(): Meeting[] {
    return Array.from(this.meetings.values());
  }

  public deleteMeeting(name: string): boolean {
    return this.meetings.delete(name.toLowerCase());
  }

  // Scheduled Meetings
  public saveScheduledMeeting(scheduled: ScheduledMeeting): void {
    this.scheduledMeetings.set(scheduled.id, scheduled);
  }

  public getScheduledMeeting(id: string): ScheduledMeeting | undefined {
    return this.scheduledMeetings.get(id);
  }

  public getAllScheduledMeetings(): ScheduledMeeting[] {
    return Array.from(this.scheduledMeetings.values()).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }

  public deleteScheduledMeeting(id: string): boolean {
    return this.scheduledMeetings.delete(id);
  }

  private seedDefaultData() {
    const defaultMeeting = new Meeting(
      "meet_eng_sync",
      "Engineering Weekly Sync",
      ["alice@company.com", "bob@company.com", "charlie@company.com", "david@company.com"]
    );
    this.saveMeeting(defaultMeeting);

    const execMeeting = new Meeting(
      "meet_product_review",
      "Executive Product Review",
      ["elena@company.com", "marcus@company.com", "sarah@company.com"]
    );
    this.saveMeeting(execMeeting);
  }
}
