import { Command } from "eris";
import { readdirSync } from 'fs';
import Client from "./Struct/Client";


export default class Handler {
	static counter: string[] = [];

	constructor() {}

	public static commands(client: Client): void {
		readdirSync('./Commands/').forEach((dir: string): void => {
			const commands: string[] = readdirSync(`./Commands/${dir}/`).filter((file: string) => file.endsWith(".ts")); // Get command files

			for(let file of commands) {
				let commandFiles = require(`./Commands/${dir}/${file}`).default;
				const command = new commandFiles(client); // Import command file

				if(command) {
					const erisCommand: Command = client.registerCommand(command.label, command.execute);

					// Command configuration (only what is needed)
					erisCommand.category    = command.category;
					erisCommand.client      = command.client;
					erisCommand.description = command.description;
					erisCommand.caseInsensitive = true;
					
					// Register aliases if have
					if(Array.isArray(command.aliases)) command.aliases.forEach((alias: string) => client.registerCommandAlias(alias, command.label));
					
					this.counter.push(file); // Add to counter (I know this is obvius, just commenting for better organization)
				} else {
					console.log(`- ${file} Error -> missing a help.name, or help.name is not a string.`);
					continue;
				}
			}
		});
		console.log(`\n- Loaded ${this.counter.length} Commands -\n`);
		this.counter = []; // Clear counter for events
	}


	public static events(client: Client): void {
		const load_dir = (dir: string) => {
			const events: string[] = readdirSync(`./Events/${dir}`).filter((file: string) => file.endsWith(".ts")); // Get event files

			for(const file of events) {
				const event = require(`./Events/${dir}/${file}`).default; // Import event file
				let eventName: string = file.split(".")[0];
				client.on(eventName, event.bind(null, client)); // client.on(event, function)

				this.counter.push(eventName);
			}
		}
	
		["client", "guild"].forEach((e) => load_dir(e)); // For each event type, load all
		for(let i = 0; i < this.counter.length; i++) {
			console.log(`${i+1}. ${this.counter[i]} Ready`); // Events ready
		}
		
		console.log(`\n- Loaded ${this.counter.length} Events -`);
		console.log("\nLogging into the BOT...");
	}

}
