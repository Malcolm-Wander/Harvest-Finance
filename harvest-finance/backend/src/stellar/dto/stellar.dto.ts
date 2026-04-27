import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateEscrowDto {
    @ApiProperty({ example: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX' })
    @IsString()
    @IsNotEmpty()
    @Length(56, 56)
    farmerPublicKey: string;

    @ApiProperty({ example: 'GBUYER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGH' })
    @IsString()
    @IsNotEmpty()
    @Length(56, 56)
    buyerPublicKey: string;

    @ApiProperty({ example: '1000.0000000', description: 'Amount as a numeric string' })
    @IsString()
    @IsNotEmpty()
    amount: string;

    @ApiPropertyOptional({ example: 'USDC', description: 'Asset code, defaults to XLM' })
    @IsString()
    @IsOptional()
    assetCode?: string;

    @ApiPropertyOptional({ description: 'Asset issuer, required for non-native assets' })
    @IsString()
    @IsOptional()
    assetIssuer?: string;

    @ApiProperty({ example: 1746057600, description: 'Unix timestamp (seconds) for escrow expiry' })
    @IsNumber()
    @Min(0)
    deadlineUnixTimestamp: number;

    @ApiProperty({ example: 'order-123', description: 'Internal order ID referenced by the memo' })
    @IsString()
    @IsNotEmpty()
    orderId: string;
}

export class ReleasePaymentDto {
    @ApiProperty({ description: 'Claimable balance ID returned by createEscrow' })
    @IsString()
    @IsNotEmpty()
    balanceId: string;

    @ApiProperty({ example: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX' })
    @IsString()
    @IsNotEmpty()
    @Length(56, 56)
    farmerPublicKey: string;

    @ApiProperty({ description: 'Farmer secret key (S-address)' })
    @IsString()
    @IsNotEmpty()
    farmerSecretKey: string;
}

export class RefundDto {
    @ApiProperty({ description: 'Claimable balance ID to refund' })
    @IsString()
    @IsNotEmpty()
    balanceId: string;

    @ApiProperty({ example: 'GBUYER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGH' })
    @IsString()
    @IsNotEmpty()
    @Length(56, 56)
    buyerPublicKey: string;

    @ApiProperty({ description: 'Buyer secret key (S-address)' })
    @IsString()
    @IsNotEmpty()
    buyerSecretKey: string;
}

export class SetupMultiSigDto {
    @ApiProperty({ description: 'Primary account public key' })
    @IsString()
    @IsNotEmpty()
    @Length(56, 56)
    primaryPublicKey: string;

    @ApiProperty({ type: [String], description: 'Cosigner public keys' })
    cosignerPublicKeys: string[];

    @ApiProperty({ example: 2, description: 'Signing threshold (1..N)' })
    @IsNumber()
    @Min(1)
    threshold: number;

    @ApiProperty({ description: 'Secret key of the account being configured' })
    @IsString()
    @IsNotEmpty()
    sourceSecretKey: string;
}