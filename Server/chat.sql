CREATE TABLE `chat_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner` int(11) NOT NULL,
  `img` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `chat_group_users` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_group` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `chat_messages` (
  `id_mex` bigint(20) NOT NULL,
  `id_mex_merge` varchar(255) NOT NULL COMMENT 'When sending a message, multiple lines are created (one for each user in the group) because each message is encrypted with a different key. Each message will have a different mex_id but an identical merge_id',
  `from_user` bigint(20) NOT NULL,
  `to_group` bigint(20) NOT NULL,
  `to_user` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `status` int(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `chat_status` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_mex` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `chat_users` (
  `id` bigint(20) NOT NULL,
  `id_user` bigint(20) NOT NULL,
  `public_key` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `chat_group_users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id_mex`);

ALTER TABLE `chat_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_mex`,`status`);

ALTER TABLE `chat_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_user` (`id_user`);

ALTER TABLE `chat_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_group_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_messages`
  MODIFY `id_mex` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;