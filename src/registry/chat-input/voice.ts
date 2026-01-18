import { SlashCommandBuilder } from "discord.js";
import { Command } from "rhidium/core/commands/base";
import { CommandType } from "rhidium/core/commands/types";
import { Embeds } from "rhidium/core/config/embeds";
import { isDynamicChannel } from "../../voice-state/service";

const VoiceCommand = new Command({
  enabled: {
    global: true,
    guildOnly: true,
    nsfw: false,
  },
  type: CommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Voice channel management commands for Dynamic Voice Channels')
    .addSubcommandGroup(group =>
      group
       .setName('members')
        .setDescription('Manage members in your current voice channel')
        .addSubcommand(subcommand =>
          subcommand
            .setName('list')
            .setDescription('List members in your current voice channel')
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('move')
            .setDescription('Move a member to your current voice channel')
            .addUserOption(option =>
              option
                .setName('member')
                .setDescription('The member to move to your voice channel')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('remove')
            .setDescription('Remove (disconnect) a member from your current voice channel')
            .addUserOption(option =>
              option
                .setName('member')
                .setDescription('The member to remove from your voice channel')
                .setRequired(true)
            )
        )
    ),
  category: "Dynamic Voice Channels",
  interactions: {
    deferReply: true,
    refuseUncached: true,
    replyEphemeral: true,
  },
  controllers: {
    members: {
      list: async ({ interaction }) => {
        const { member } = interaction;

        if (!member.voice.channel) {
          await VoiceCommand.reply(interaction, Embeds.error('You are not in a voice channel.'));
          return;
        }

        const channelMembers = member.voice.channel.members;
        if (channelMembers.size === 0) {
          await VoiceCommand.reply(interaction, Embeds.info('There are no members in your voice channel.'));
          return;
        }

        const memberList = channelMembers.map(m => `- ${m.user.globalName} (${m.user.username}, \`${m.id}\`)`).join('\n');
        const memberListSuffix = `\n\n**Total members**: ${channelMembers.size}\n**Link**: ${member.voice.channel.toString()}\n**Format**: \`Display Name (Username, ID)\``;

        await VoiceCommand.reply(
          interaction,
          Embeds.info({
            title: `Members in ${member.voice.channel.name}:`,
            description: memberList.concat(memberListSuffix),
          })
        );
      },
      move: async ({ interaction }) => {
        const { member } = interaction;

        if (!member.voice.channel) {
          await VoiceCommand.reply(interaction, Embeds.error('You are not in a voice channel.'));
          return;
        }

        if (!(await isDynamicChannel(member.voice.channel.id))) {
          await VoiceCommand.reply(interaction, Embeds.error('Your current voice channel is not a dynamic voice channel.'));
          return;
        }

        const targetUser = interaction.options.getUser('member', true);
        const targetMember = member.voice.channel.members.get(targetUser.id) || (
          await interaction.guild.members.fetch(targetUser.id).catch(() => null)
        )

        if (!targetMember) {
          await VoiceCommand.reply(interaction, Embeds.error('The specified member could not be found in this guild.'));
          return;
        }

        if (!targetMember.voice.channel) {
          await VoiceCommand.reply(interaction, Embeds.error('The specified member is not in a voice channel.'));
          return;
        }

        if (targetMember.voice.channelId === member.voice.channelId) {
          await VoiceCommand.reply(interaction, Embeds.error('The specified member is already in your voice channel.'));
          return;
        }

        await targetMember.voice.setChannel(member.voice.channel, `Requested by ${member.user.globalName} via Dynamic Voice Channels command`);
        await VoiceCommand.reply(interaction, Embeds.success(`Moved ${targetMember.user.globalName} to your voice channel.`));
      },
      remove: async ({ interaction }) => {
        const { member } = interaction;

        if (!member.voice.channel) {
          await VoiceCommand.reply(interaction, Embeds.error('You are not in a voice channel.'));
          return;
        }

        if (!(await isDynamicChannel(member.voice.channel.id))) {
          await VoiceCommand.reply(interaction, Embeds.error('Your current voice channel is not a dynamic voice channel.'));
          return;
        }

        const targetUser = interaction.options.getUser('member', true);
        const targetMember = member.voice.channel.members.get(targetUser.id) || (
          await interaction.guild.members.fetch(targetUser.id).catch(() => null)
        )

        if (!targetMember) {
          await VoiceCommand.reply(interaction, Embeds.error('The specified member could not be found in this guild.'));
          return;
        }

        if (!targetMember.voice.channel || targetMember.voice.channelId !== member.voice.channelId) {
          await VoiceCommand.reply(interaction, Embeds.error('The specified member is not in your voice channel.'));
          return;
        }

        await targetMember.voice.disconnect(`Requested by ${member.user.globalName} via Dynamic Voice Channels command`);
        await VoiceCommand.reply(interaction, Embeds.success(`Removed ${targetMember.user.globalName} from your voice channel.`));
      }
    }
  }
})
  
export default VoiceCommand;