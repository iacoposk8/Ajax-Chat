-- --------------------------------------------------------

--
-- Struttura della tabella `chat_groups`
--

CREATE TABLE `chat_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner` int(11) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `chat_group_users`
--

CREATE TABLE `chat_group_users` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_group` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id_mex` bigint(20) NOT NULL,
  `from_user` bigint(20) NOT NULL,
  `to_group` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `status` int(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date2` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date3` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `chat_group_users`
--
ALTER TABLE `chat_group_users`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id_mex`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `chat_groups`
--
ALTER TABLE `chat_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `chat_group_users`
--
ALTER TABLE `chat_group_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id_mex` bigint(20) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
